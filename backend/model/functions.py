
from YandexGPT import YandexLLM
from vectorstore import ExtraInfoDB, SummaryDB


extra_info_db = ExtraInfoDB()
summary_db = SummaryDB()
super_model = YandexLLM()

for doc in docs:
    doc["summary"] = super_model.summarize_context(doc["text"])
    doc["extrainfo"] = super_model.get_extrainfo(doc["text"])

docs = [{
    "id": None,
    "doc_name": None,
    "summary": None,
    "extrainfo": None,
    "text": None,
    "is_root": None,
    "is_visited": False
}]

