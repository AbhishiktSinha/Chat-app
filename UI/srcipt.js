const joinChatForm = document.querySelector('.join-chat-form');
const joinChatContainer = joinChatForm.parentElement;

const chatAppScreen = document.querySelector('.main-app-ui');
const messagesDisplayContainer = chatAppScreen.querySelector('.messages-display-container');

const createMessageForm = document.querySelector('#create-message-form');

// let socket = io();


let conversationData;

let username;

joinChatForm.addEventListener('submit', (event)=> {
    
    event.preventDefault();
    
    conversationData = {
        id: socket.id,
        username: undefined,
        message: undefined,
    }
    // console.log(socket.id, conversationData);

    username = joinChatForm.usernameInput.value;
    
    conversationData.username = username;

    joinChatContainer.classList.add('hide');
    joinChatForm.reset();

    chatAppScreen.classList.remove('hide');

    createSystemNotification(`${username} joined the chat`, true);
})

function createSystemNotification(message, emit) {
    const systemNotification = document.createElement('div');
    systemNotification.textContent = message;
    systemNotification.classList.add('system-notification');

    messagesDisplayContainer.appendChild(systemNotification);

    if (emit) {
        socket.emit('systemmessage', {"message": message, 'id': socket.id});
        console.log('emiting system message');
    }
}

// message send action is taken---------------------------------------

    // prevent emoji button from acting as submit button
    const emojiButton = createMessageForm.querySelector('button[type="menu"]');
    emojiButton.addEventListener('click', (event)=> {
        event.preventDefault();
    })
createMessageForm.addEventListener('submit', (event)=> {
    event.preventDefault();
    const message = createMessageForm.messageInput.value;

    if (message === '') {
        return;
    }
    conversationData.message = message;

    createMessageForm.reset();

    // send message
    sendMessage(conversationData);
})

function sendMessage(conversationData) {
    socket.emit('chatmessage_sent', conversationData);
    
    // render messagebox on screen
    renderMessage(conversationData,true);
}

function renderMessage(conversationData, isSent) {    
    
    const lastMessage = messagesDisplayContainer.lastElementChild;
    const lastMessageType = (lastMessage && !lastMessage.classList.contains('system-notification')) ? (lastMessage.classList.contains('sent') ? 'sent' : 'recieved') : undefined;

    console.log('lastMessageType', lastMessageType, 'last message is system message?',lastMessage.classList.contains('system-notification'));
    console.log(lastMessage);

    let messageBox = document.createElement('div');
    let messageType;
    
    if (isSent) {
        messageBox.classList.add('sent');
        messageType = 'sent';
    }
    else {
        messageBox.classList.add('recieved');
        messageType = 'recieved';
    }
    
    // check if there is no valid last message, or different type of last message
    if (!lastMessageType || lastMessageType !== messageType) {

        createMessageBox(messageBox, conversationData, true);        
    }
    else {
        createMessageBox(messageBox, conversationData);
    }

    messagesDisplayContainer.appendChild(messageBox);
}

function createMessageBox(messageBox,conversationData, leadingMessage) {
    messageBox.classList.add('message-box');

    messageBox.innerHTML = `<div class="message-content-container">${conversationData.message}</div>`

    if (leadingMessage) {
        messageBox.innerHTML = `<div class="avatar"></div>
        <div class="sender-details-header">~${conversationData.username}</div>` + messageBox.innerHTML;        

        messageBox.classList.add('primary');
    }

}


// handle incoming messages 
socket.on('chatmessage_recieved', (conversationData)=> {
    if (socket.id === conversationData.id) {
        return;
    }
    renderMessage(conversationData, false);
})

socket.on('systemmessage', (messageData)=> {

    console.log(messageData.id === socket.id);
    if(socket.id === messageData.id) {
        return;
    }
    createSystemNotification(messageData.message);
})




// user left actions
function userLeaveAction() {
    const message = `${conversationData.username} left the chat`;
    createSystemNotification(message, true);
}

window.onunload = userLeaveAction;

document.querySelector('.leave-room').addEventListener('click', ()=> {
    chatAppScreen.classList.add('hide');
    joinChatContainer.classList.remove('hide');
    userLeaveAction();
});