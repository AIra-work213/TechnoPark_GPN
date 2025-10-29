const sendTakeDocs = async (data) => {
    // Здесь можно обработать полученные данные и выполнить необходимые действия
    console.log("Полученные данные:", data);
    
    // Пример ответа
    return { message: "Документы успешно получены", receivedData: data };
}

module.exports = {
    sendTakeDocs : sendTakeDocs
}