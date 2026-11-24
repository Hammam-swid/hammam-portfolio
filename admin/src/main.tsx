import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import "./index.css";
import { AuthProvider, RequireAuth } from "./lib/auth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { ProjectForm, ProjectsList } from "./pages/Projects";
import { SkillForm, SkillsList } from "./pages/Skills";
import { ExperienceForm, ExperiencesList } from "./pages/Experiences";

const router = createBrowserRouter([
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      { path: "/login", element: <Login /> },
      {
        element: (
          <RequireAuth>
            <Layout />
          </RequireAuth>
        ),
        children: [
          { index: true, element: <Dashboard /> },
          { path: "projects", element: <ProjectsList /> },
          { path: "projects/:id", element: <ProjectForm /> },
          { path: "skills", element: <SkillsList /> },
          { path: "skills/:id", element: <SkillForm /> },
          { path: "experiences", element: <ExperiencesList /> },
          { path: "experiences/:id", element: <ExperienceForm /> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
