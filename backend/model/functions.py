
from YandexGPT import YandexLLM
from vectorstore import ExtraInfoDB, SummaryDB
from pydantic import BaseModel

class Document(BaseModel):
    id: str
    doc_name: str = ""
    summary: str
    extrainfo: str
    text: str
    is_root: bool
    is_visited: bool = False

def get_docs(docs: list[Document]):
    return docs
docs = get_docs()
extra_info_db = ExtraInfoDB()
summary_db = SummaryDB()
super_model = YandexLLM()

for doc in docs:
    doc.summary = super_model.summarize_context(doc.text)
    doc.extrainfo = super_model.get_extrainfo(doc.text)

all_visited = []



