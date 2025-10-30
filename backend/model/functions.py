
from YandexGPT import YandexLLM
from vectorstore import ExtraInfoDB, SummaryDB
from pydantic import BaseModel
import json
from fastapi import FastAPI
import uvicorn
import requests


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
        """Верим в ее работу"""   
        
        for doc in docs:
            doc.summary = super_model.summarize_context(doc.text)
            doc.extrainfo = super_model.get_extrainfo(doc.text)

        root = []
        for doc in docs:
            if doc.is_root:
                root.append(doc)
                doc.is_visited = True
        root = root[0]


        # Загрузка всех текстов в векторные с правильной метадатой
        for doc in docs:
            summary_db.add_documents(doc.summary, {"doc_id": doc.id, "doc_name": doc.doc_name, "text": doc.text, "is_visited": doc.is_visited})
            extra_info_db.add_documents(doc.extrainfo, {"doc_id": doc.id, "doc_name": doc.doc_name, "text": doc.text, "is_visited": doc.is_visited})


        res = None
        curr_doc = None
        history = root.text + "\n"
        while True:
            root = curr_doc if curr_doc else root

            # Ищем 4 по summary
            summary_docs = summary_db.search_documents(query=root.summary, filter={"is_visited": False})
            all_ids = [doc[0].metadata["doc_id"] for doc in summary_docs]

            # Среди 4 вычисляем extra_info score
            best_docs = extra_info_db.search_documents(query=root.extrainfo, filter={"is_visited": False, "doc_id": {"$in": all_ids}})

            # Среднее гармоническое по скурам - наш вес
            K_weight = [(2 * (0.7 * doc1[1] * 0.3 * doc2[1])/(doc1[1] + doc2[1]), doc1[0].metadata) for doc1, doc2 in zip(best_docs, summary_docs)]
            K_weight.sort(key=lambda x: x[0], reverse=True)
            K_weight = K_weight[:2]

            if len(K_weight) < 2:
                response = super_model.generate_answer(context=[doc[1]['text'] for doc in K_weight], history=history, conclusions=res["useful_info"] if res else "")
                res = json.loads(response)
                return res


            # Кортеж (score, doc[metadata]) из 2 самых лучших документов
            response = super_model.generate_response(context=[doc[1]['text'] for doc in K_weight], history=history, conclusions=res["useful_info"] if res else "")
            history += '\n'.join([f"Документ: {doc[1]['text']}, Оценка релевантности: {doc[0]}" for doc in K_weight])


            res = json.loads(response)
            if res["is_answer"]:
                return res
            
            for_mark = []
            curr_doc = []
            if str(res["number"]) == "1":
                curr_id = K_weight[0][1]["doc_id"]
                for_mark.append(curr_id)
                for doc in docs:
                    if doc.id == curr_id:
                        curr_doc.append(doc)
                    elif doc.id == K_weight[1][1]["doc_id"]:
                        for_mark.append(doc.id)
            else:
                curr_id = K_weight[1][1]["doc_id"]
                for_mark.append(curr_id)
                for doc in docs:
                    if doc.id == curr_id:
                        curr_doc.append(doc)
                    elif doc.id == K_weight[0][1]["doc_id"]:
                        for_mark.append(doc.id)
            if not curr_doc:
                return {"is_answer": False, "reason": f"Документ {curr_id} не найден"}
            curr_doc = curr_doc[0]

            summary_db.mark_visited(for_mark)
            extra_info_db.mark_visited(for_mark)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)