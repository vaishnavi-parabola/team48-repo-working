import os
from langchain_aws.chat_models import ChatBedrock
from langchain_core.runnables import RunnableLambda
from langchain_core.tracers import LangChainTracer
from langchain_core.messages import HumanMessage

# LangSmith setup
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = "AP-Police-Analyst"

# Initialize Bedrock Claude model
claude_model = ChatBedrock(
    model_id="anthropic.claude-3-5-sonnet-20240620-v1:0",
    region_name="us-east-1",
    temperature=0.5,
    max_tokens=1024
)

def run_traced_claude_task(prompt: str,agent_name: str = "Default Agent") -> str:
    tracer = LangChainTracer()
    chain = RunnableLambda(lambda x: claude_model.invoke([HumanMessage(content=x)]))
    chain = chain.with_config({"run_name": agent_name})  # ✅ Add LangSmith run label
    response = chain.invoke(prompt)

    # Extract content from AIMessage and return as string
    return response.content.strip()
