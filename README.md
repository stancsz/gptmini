
# Minimalist Chat App

A simple and minimalist chat application that allows users to communicate with OpenAI's GPT-4. This application requires an OpenAI API key to function.

<img width="1133" alt="image" src="https://github.com/stancsz/my-chat-app/assets/43565411/08040d1e-d148-4542-9fa4-f0d65c52d889">


## Features

- **Simple UI**: A clean and minimalist user interface.
- **Real-time Communication**: Send and receive messages in real-time.
- **Local Storage of API Key**: Your OpenAI API key is stored locally in your browser.
- **Download Chat History**: Download the entire chat or the last AI response.
- **Clear Chat History**: Clear the current chat session.

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/stancsz/my-chat-app.git
   cd my-chat-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the application**:
   ```bash
   npm start
   ```

4. **Build the application**
   ```bash
   npx --no-install next build
   ```

## Usage

1. **Open the application**: Navigate to `http://localhost:3000` in your web browser.
2. **Enter your OpenAI API Key**: You will be prompted to enter your OpenAI API key. You can get your API key [here](https://platform.openai.com/api-keys).
3. **Start chatting**: Type your message in the input box and press "Send".
4. **Download chat history**: Use the "Download Entire Chat" or "Download Last AI Response" buttons to save your chat history.
5. **Clear chat history**: Use the "Clear" button to clear the current chat session.

## File Structure

- `favicon.ico`: Icon for the application.
- `globals.css`: Global CSS styles for the application.
- `layout.tsx`: Main layout component for the application.
- `page.tsx`: Main page component where the chat functionality is implemented.

## Contributing

Contributions are welcome! Please fork this repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [OpenAI](https://www.openai.com) for their GPT-4 API.
- [React](https://reactjs.org) for the UI framework.
- [Next.js](https://nextjs.org) for the web development framework.

## Contact

For any questions or feedback, please open an issue on [GitHub](https://github.com/stancsz/my-chat-app/issues).
