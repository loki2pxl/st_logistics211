import React from "react"
import ReactDOM from "react-dom/client"

import App from "./App"
import AppMock from "./App.mock"

const USE_MOCK = true

const root = ReactDOM.createRoot(document.getElementById("root"))

root.render(
  USE_MOCK ? <AppMock /> : <App />
)

// ❌ DELETE EVERYTHING BELOW THIS LINE
// if (!user) { ... } logic goes inside App or AppMock!
