
from YandexGPT import YandexLLM
from vectorstore import ExtraInfoDB, SummaryDB
from pydantic import BaseModel
import json
from fastapi import FastAPI


app = FastAPI()

extra_info_db = ExtraInfoDB()
summary_db = SummaryDB()

super_model = YandexLLM()

class Document(BaseModel):
    id: str
    doc_name: str = ""
    summary: str
    extrainfo: str
    text: str
    is_root: bool
    is_visited: bool = False

@app.post("/datas")
def get_docs(docs: list[Document]):
    return docs

docs = get_docs()
for doc in docs:
    doc.summary = super_model.summarize_context(doc.text)
    doc.extrainfo = super_model.get_extrainfo(doc.text)

all_visited = []
docs.sort(key=lambda x: x.is_root, reverse=True)

root = [doc for doc in docs if doc.is_root]
root = root[0]


root.is_visited = True

# Загрузка всех текстов в векторные с правильной метадатой
for doc in docs:
    summary_db.add_documents(doc.summary, {"doc_id": doc.id, "doc_name": doc.doc_name, "text": doc.text, "is_visited": doc.is_visited})
    extra_info_db.add_documents(doc.extrainfo, {"doc_id": doc.id, "doc_name": doc.doc_name, "text": doc.text, "is_visited": doc.is_visited})


# Ищем 4 по summary
summary_docs = summary_db.search_documents(query=root.summary, filter={"is_visited": False})
all_ids = [doc[0]["metadata"]["doc_id"] for doc in summary_docs] # Не уверен в извлечении ID (уверен)

# Среди 4 вычисляем extra_info score
best_docs = extra_info_db.search_documents(query=root.extrainfo, filter={"is_visited": False, "doc_id": {"$in": all_ids}})

# Среднее гармоническое по скурам - наш вес
K_weight = [(2 * (0.7 * doc1[1] * 0.3 * doc2[1])/(doc1[1] + doc2[1]), doc1[0]["metadata"]) for doc1, doc2 in zip(best_docs, summary_docs)]
K_weight.sort(key=lambda x: x[0], reverse=True)
K_weight = K_weight[:2]
# Кортеж (score, doc[metadata]) из 2 самых лучших документов
"""Здесь моделе отдаем документы и она уже решает куда пойти"""


