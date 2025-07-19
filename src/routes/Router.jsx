import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Import your pages/components as needed
import Dashboard from "./pages/Dashboard";
import ImageToolkit from "./pages/ImageToolkit";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import Unavailable from "./pages/Unavailable";
import ServerError from "./pages/ServerError";


export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Static Routes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/toolkit" element={<ImageToolkit />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/not_found" element={<NotFound />} />
        <Route path="/unavailable" element={<Unavailable />} />
        <Route path="/server_error" element={<ServerError />} />
        <Route path="/nodes" element={<Navigate to="/not_found" replace />} />
        <Route path="/refresh" element={<Navigate to="/not_found" replace />} />

        {/* Resourceful Routes Example for projects */}
        <Route path="/projects" element={<ProjectsList />} />
        <Route path="/projects/new" element={<ProjectNew />} />
        <Route path="/projects/:id" element={<ProjectShow />} />
        <Route path="/projects/:id/edit" element={<ProjectEdit />} />

        <Route path='/' element={<FrontPageView />} />
        {/* <Route exact path='/admin' element={<PrivateRoute />}>
            <Route exact path='/admin' element={<EditorView />} />
        </Route> */}
        {/* <Route exact path='/historic_captures/show/:id' element={ <CaptureView /> } />, */}
        {/* <Route exact path='/historic_images/show/:id' element={ <ImageView /> } />, */}
        {/* <Route exact path='/modern_captures/show/:id' element={ <CaptureView /> } />, */}
        {/* <Route exact path='/modern_images/show/:id' element={ <ImageView /> } />, */}
        {/* <Route exact path='/supplemental_images/show/:id' element={ <ImageView /> } />, */}
        <Route path='/:model/show/:id' element={ <NodeView /> } />,
        <Route path='/401' element={
            <ErrorView code={'401'} title={'Not Authorized'} message={'You are not authorized to view this page.'} /> 
            } />
        <Route path='/5xx' element={
            <ErrorView code={'5xx'} title={'Server Error'} message={'The server encountered an error and could not complete your request.'} /> 
            } /> 
        <Route path='*' element={
            <ErrorView code={'404'} title={'Page Not Found'} message={'The page you are looking for does not exist.'} /> 
            } />

        {/* Repeat for other models as needed */}
        {/* ... */}

        {/* 404 fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}