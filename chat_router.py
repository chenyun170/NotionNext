import sqlite3
import httpx
import asyncio
import re
from fastapi import APIRouter, Request, UploadFile, File, Form

# ================= 配置区域 =================
# 建议从环境变量或配置文件读取，不要直接提交到 GitHub
TG_BOT_TOKEN = "6726665988:AAFBKaFyKxQyR0kZU5OaLWy95rHvu8eYsms"  
TG_ADMIN_ID = "5268531397"       
# ===========================================

router = APIRouter()
DB_FILE = "chat.db" # 独立数据库，避免冲突

# 初始化数据库
def init_chat_db():
    conn = sqlite3.connect(DB_FILE)
    conn.execute('''CREATE TABLE IF NOT EXISTS chat_sessions (session_id TEXT PRIMARY KEY, nickname TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    conn.execute('''CREATE TABLE IF NOT EXISTS chat_msgs (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT, direction TEXT, content TEXT, is_read INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    conn.commit()
    conn.close()

init_chat_db()

# --- TG 发送工具 ---
async def send_tg_message(text):
    if "填在这里" in TG_BOT_TOKEN: return
    url = f"https://api.telegram.org/bot{TG_BOT_TOKEN}/sendMessage"
    async with httpx.AsyncClient() as client:
        try:
            await client.post(url, json={"chat_id": TG_ADMIN_ID, "text": text, "parse_mode": "HTML"})
        except Exception as e:
            print(f"❌ TG发送失败: {e}")

async def send_tg_photo(caption, file_bytes, filename):
    if "填在这里" in TG_BOT_TOKEN: return
    url = f"https://api.telegram.org/bot{TG_BOT_TOKEN}/sendPhoto"
    async with httpx.AsyncClient() as client:
        try:
            files = {'photo': (filename, file_bytes)}
            data = {'chat_id': TG_ADMIN_ID, 'caption': caption, 'parse_mode': 'HTML'}
            await client.post(url, data=data, files=files)
        except Exception as e:
            print(f"❌ 发图失败: {e}")

# --- 后台任务：监听 TG 回复 ---
async def telegram_polling_loop():
    if "填在这里" in TG_BOT_TOKEN: 
        print("⚠️ 未配置 Telegram Token，客服监听未启动")
        return
    
    offset = 0
    print("🚀 [客服系统] Telegram 监听已启动...")
    while True:
        try:
            url = f"https://api.telegram.org/bot{TG_BOT_TOKEN}/getUpdates"
            async with httpx.AsyncClient(timeout=20) as client:
                resp = await client.get(url, params={"offset": offset, "timeout": 10})
                if resp.status_code == 200:
                    data = resp.json()
                    for item in data.get("result", []):
                        offset = item["update_id"] + 1
                        if "message" in item:
                            msg = item["message"]
                            # 监听回复消息
                            if "text" in msg and "reply_to_message" in msg:
                                original = msg["reply_to_message"].get("text") or msg["reply_to_message"].get("caption") or ""
                                match = re.search(r"🆔ID: ([\w\-]+)", original)
                                if match:
                                    target_sid = match.group(1)
                                    conn = sqlite3.connect(DB_FILE)
                                    conn.execute("INSERT INTO chat_msgs (session_id, direction, content) VALUES (?, 'out', ?)", (target_sid, msg["text"]))
                                    conn.commit(); conn.close()
                                    print(f"✅ 回复用户 {target_sid}: {msg['text']}")
        except: await asyncio.sleep(5)
        await asyncio.sleep(1)

# --- API 接口 ---
@router.post("/api/chat/login")
async def chat_login(request: Request):
    data = await request.json()
    sid, name = data.get("session_id"), data.get("nickname")
    if not sid or not name: return {"success": False}
    conn = sqlite3.connect(DB_FILE)
    conn.execute("INSERT OR REPLACE INTO chat_sessions (session_id, nickname) VALUES (?, ?)", (sid, name))
    conn.commit(); conn.close()
    await send_tg_message(f"👋 <b>新客户接入</b>\n👤 称呼: {name}\n🆔ID: {sid}")
    return {"success": True}

@router.post("/api/chat/send")
async def chat_send(request: Request):
    data = await request.json()
    sid, content = data.get("session_id"), data.get("content")
    conn = sqlite3.connect(DB_FILE)
    cur = conn.execute("SELECT nickname FROM chat_sessions WHERE session_id=?", (sid,))
    res = cur.fetchone()
    name = res[0] if res else "未知用户"
    conn.execute("INSERT INTO chat_msgs (session_id, direction, content) VALUES (?, 'in', ?)", (sid, content))
    conn.commit(); conn.close()
    await send_tg_message(f"📩 <b>客户消息</b>\n👤 称呼: {name}\n🆔ID: {sid}\n------------------\n{content}\n------------------\n💡 <i>请回复此消息</i>")
    return {"success": True}

@router.post("/api/chat/upload")
async def chat_upload(session_id: str = Form(...), file: UploadFile = File(...)):
    try:
        conn = sqlite3.connect(DB_FILE)
        cur = conn.execute("SELECT nickname FROM chat_sessions WHERE session_id=?", (session_id,))
        res = cur.fetchone()
        name = res[0] if res else "未知用户"
        file_bytes = await file.read()
        
        conn.execute("INSERT INTO chat_msgs (session_id, direction, content) VALUES (?, 'in', ?)", (session_id, "[发送了一张图片]"))
        conn.commit(); conn.close()
        
        caption = f"🖼 <b>客户图片</b>\n👤 称呼: {name}\n🆔ID: {session_id}\n💡 <i>请回复此图片</i>"
        await send_tg_photo(caption, file_bytes, file.filename)
        return {"success": True}
    except Exception as e: return {"success": False, "error": str(e)}

@router.get("/api/chat/poll")
async def chat_poll(session_id: str):
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM chat_msgs WHERE session_id=? ORDER BY created_at ASC LIMIT 50", (session_id,)).fetchall()
    conn.close()
    return {"messages": [dict(r) for r in rows]}
