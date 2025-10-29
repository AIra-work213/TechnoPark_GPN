from langchain_community.vectorstores import Chroma
from langchain_huggingface.embeddings import HuggingFaceEmbeddings


# def _results_to_docs_and_scores(results: Any) -> List[Tuple[Document, float]]:
embed_func = HuggingFaceEmbeddings(model_name = 'sentence-transformers/all-MiniLM-L6-v2')
class SummaryDB:
    def __init__(self):
        global embed_func

        self.vectorDB_summary = Chroma(
            collection_name='Summarization',
            embedding_function=embed_func,
            persist_directory="./SummaryDB"
        )
    def add_documents(self, docs, metadatas):
        self.vectorDB_summary.add_documents(docs, metadatas)
    def search_documents(self, query):
        results = self.vectorDB_summary.similarity_search_score(query, k=4)
        return results

class ExtraInfoDB:
    def __init__(self):
        global embed_func

        self.vectorDB_extrainfo = Chroma(
            collection_name='ExtraInformation',
            embedding_function=embed_func,
            persist_directory="./ExtraInfoDB"
        )
    def add_documents(self, docs, metadatas):
        self.vectorDB_extrainfo.add_documents(docs, metadatas)
        return 'Успешно!'
    def search_documents(self, query):
        results = self.vectorDB_extrainfo.similarity_search_score(query, k=2)
        return results
