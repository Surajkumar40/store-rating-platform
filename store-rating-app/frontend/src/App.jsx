import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth, homeFor } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/auth/Login.jsx';
import Signup from './pages/auth/Signup.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import NotFound from './pages/NotFound.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import Users from './pages/admin/Users.jsx';
import UserDetail from './pages/admin/UserDetail.jsx';
import Stores from './pages/admin/Stores.jsx';
import AddUser from './pages/admin/AddUser.jsx';
import AddStore from './pages/admin/AddStore.jsx';
import StoreList from './pages/user/StoreList.jsx';
import OwnerDashboard from './pages/owner/OwnerDashboard.jsx';

function Home() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={user ? homeFor(user.role) : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/password" element={<ChangePassword />} />
          <Route element={<ProtectedRoute roles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<Users />} />
            <Route path="/admin/users/new" element={<AddUser />} />
            <Route path="/admin/users/:id" element={<UserDetail />} />
            <Route path="/admin/stores" element={<Stores />} />
            <Route path="/admin/stores/new" element={<AddStore />} />
          </Route>
          <Route element={<ProtectedRoute roles={['USER']} />}>
            <Route path="/stores" element={<StoreList />} />
          </Route>
          <Route element={<ProtectedRoute roles={['OWNER']} />}>
            <Route path="/owner" element={<OwnerDashboard />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
