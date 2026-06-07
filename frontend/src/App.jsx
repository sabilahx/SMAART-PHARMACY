import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import MedicineList from './pages/MedicineList';
import AddMedicine from './pages/AddMedicine';
import EditMedicine from './pages/EditMedicine';
import MedicineDetails from './pages/MedicineDetails';
import InventoryHistory from './pages/InventoryHistory';
import InventoryTransactionForm from './pages/InventoryTransactionForm';
import TransactionDetails from './pages/TransactionDetails';
import Dashboard from './pages/Dashboard';
import ExpiryDashboard from './pages/ExpiryDashboard';
import BranchComparison from './pages/BranchComparison';
import ReorderIntelligence from './pages/ReorderIntelligence';

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
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/medicines" element={<MedicineList />} />
                            <Route path="/medicines/add" element={<AddMedicine />} />
                            <Route path="/medicines/:id" element={<MedicineDetails />} />
                            <Route path="/medicines/edit/:id" element={<EditMedicine />} />
                            <Route path="/inventory/history" element={<InventoryHistory />} />
                            <Route path="/inventory/transaction-new" element={<InventoryTransactionForm />} />
                            <Route path="/inventory/transaction/:id" element={<TransactionDetails />} />
                            <Route path="/expiry-dashboard" element={<ExpiryDashboard />} />
                            <Route path="/branch-comparison" element={<BranchComparison />} />
                            <Route path="/reorder-intelligence" element={<ReorderIntelligence />} />
                            
                            {/* Fallback routes redirection */}
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Route>
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}
