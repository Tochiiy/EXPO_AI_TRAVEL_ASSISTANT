from fastapi import FastAPI
from pydantic import BaseModel
from langchain_core.messages import HumanMessage
import uuid

from travel_agent import travel_app

app = FastAPI(title="Travel Agent AI API")

class ChatRequest(BaseModel):
    message: str
    thread_id: str = None 

@app.get("/")
async def health_check():
    return {"status": "Alive", "message": "Python AI Server is running!"}

@app.post("/api/chat")
async def chat_with_agent(req: ChatRequest):
    thread_id = req.thread_id or str(uuid.uuid4())
    config = {"configurable": {"thread_id": thread_id}}
    
    print(f"Message from the client: {req.message}")
    
    current_state = travel_app.get_state(config)
    
    #  If we  paused waiting for approval...
    if current_state.next and current_state.next[0] == "require_approval":
        if req.message.strip().lower() in ["yes", "y", "sure", "ok", "proceed"]:
            print("✅ User approved! Saving flag and resuming...")
            travel_app.update_state(config, {"user_approved": True})
            final_state = travel_app.invoke(None, config=config) # Resume!
        else:
            return {"response": "Search cancelled. What dates or locations would you like to adjust?", "thread_id": thread_id, "needs_approval": False}
    else:
        # Normal execution
        final_state = travel_app.invoke({"messages": [HumanMessage(content=req.message)]}, config=config)
    
    ai_response = final_state["messages"][-1].content
    
    # pause after this execution?
    new_state = travel_app.get_state(config)
    needs_approval = False
    
    if new_state.next and new_state.next[0] == "require_approval":
        needs_approval = True
        ai_response += "\n\n⚠️ **Action Required:** I have all your details! Reply 'yes' to search live flights and hotels, or 'no' to cancel."
        
    return {
        "response": ai_response,
        "thread_id": thread_id,
        "needs_approval": needs_approval
    }