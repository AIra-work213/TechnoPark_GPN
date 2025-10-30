const sendTakeDocs = async (payload) => {
    const documents = Array.isArray(payload?.documents) ? payload.documents : [];

    if (!documents.length) {
        throw new Error('Документы не переданы');
    }

    return documents.map((doc, index) => {
        if (!doc?.id) {
            throw new Error(`Документ под индексом ${index} не содержит идентификатора`);
        }

        return {
            id: String(doc.id),
            doc_name: doc.doc_name,
            summary: doc.summary ?? '',
            extrainfo: doc.extrainfo ?? '',
            text: doc.text ?? '',
            is_root: Boolean(doc.is_root),
            is_visited: Boolean(doc.is_visited),
        };
    });
};

module.exports = {
    sendTakeDocs,
};