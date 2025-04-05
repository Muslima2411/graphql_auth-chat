const messages = [
  {
    message: "heello",
    senderID: 1,
    recieverID: 2,
  },
  {
    message: "hi",
    senderID: 2,
    recieverID: 1,
  },

];

const users = [
  {
    userID: 1,
    email: "test1@gmail.com",
    password: "test1",
  },
  {
    userID: 2,
    email: "test2@gmail.com",
    password: "test2",
  },

];


export const userMethods = {
    login: (email, password) => {
        const user = users.find((user) => user.email === email && user.password === password);
        if (!user) {
            console.log("Invalid credentials");
            throw new Error("Invalid credentials");
        }
        console.log(`User ${user.email} logged in`);
        return user;
    },
    getAllUsers: () => {
        return users;
    },
};

export const messageMethods = {
    getAllMessages: () => {
        return messages;
    },
    getMessageById: (id) => {
        return messages.find((message) => message.id === id);
    },
    addMessage: (message) => {
        messages.push(message);
        return message;
    },
    deleteMessage: (id) => {
        const index = messages.findIndex((message) => message.id === id);
        if (index !== -1) {
        messages.splice(index, 1);
        return true;
        }
        return false;
    },  
};