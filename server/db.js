const messages = [
    {
      message: "heello",
      senderID: 1,
      senderEmail:"test1@gmail.com",
      recieverID: 2,
      recieverEmail: "test2@gmail.com",
    },
    {
      message: "hi",
      senderID: 2,
      senderEmail: "test2@gmail.com",
      recieverID: 1,
      recieverEmail: "test1@gmail.com",
    },
  
  ];
  
  const users = [
    {
      userID: 1,
      email: "1",
      password: "1",
    },
    {
      userID: 2,
      email: "2",
      password: "2",
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
