import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import MedicineList from './pages/MedicineList';
import AddMedicine from './pages/AddMedicine';
import EditMedicine from './pages/EditMedicine';

export default function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public Auth Endpoint */}
                    <Route path="/login" element={<Login />} />

                    {/* Authenticated Application Shell */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/medicines" element={<MedicineList />} />
                            <Route path="/medicines/add" element={<AddMedicine />} />
                            <Route path="/medicines/edit/:id" element={<EditMedicine />} />
                            
                            {/* Fallback routes redirection */}
                            <Route path="*" element={<Navigate to="/medicines" replace />} />
                        </Route>
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}
