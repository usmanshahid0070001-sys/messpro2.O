import { Navigate, useLocation } from"react-router-dom";
import { useAuth } from"../../context/AuthContext";
import { getDashboardPath } from"../../utils/authRoutes";
import LegalAgreementModal from"../../components/LegalAgreementModal";
import toast from"react-hot-toast";

export default function ProtectedRoute({ children, allowedRoles }) {
 const { isAuthenticated, role, loading, user, setUser, logout } = useAuth();
 const location = useLocation();

 // ── 1. Wait for AuthProvider to finish checking session ──────────────────
 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background">
 <div className="flex items-center gap-2.5">
 <div
 className="w-5 h-5 rounded-full border-[3px] border-indigo-500/20 border-t-blue-500 animate-spin"
 style={{ animationTimingFunction:'linear'}}
 />
 <span className="font-display font-black tracking-tight text-foreground text-base animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
 Verifying Session<span className="text-blue-500">.</span>
 </span>
 </div>
 </div>
 );
 }

 // ── 2. Not logged in → redirect to login ─────────────────────────────────
 if (!isAuthenticated) {
 localStorage.clear();
 sessionStorage.clear();
 return <Navigate to="/"state={{ from: location }} replace />;
 }

 // ── 3. Agreement gate — blocks ALL roles until they sign ─────────────────
 // Treats undefined (old DB users without the field) same as'pending'
 const agreementNotSigned = user?.agreement !=='signed';

 const handleAgreementAccepted = (updatedUser) => {
 // Patch the in-memory user so the gate re-evaluates without a page reload
 const merged = {
 ...user,
 agreement:'signed',
 agreementSignedAt: updatedUser?.agreementSignedAt,
 };
 localStorage.setItem('userInfo', JSON.stringify(merged));
 setUser(merged);
 };

 const handleAgreementDeclined = async () => {
 await logout();
 toast.error('You must agree to the terms to use MessPro.');
 };

 if (agreementNotSigned) {
 return (
 <>
 {/* Render a blank screen behind the modal */}
 <div className="min-h-screen bg-background dark:bg-background"/>
 <LegalAgreementModal
 isOpen={true}
 userRole={user?.role}
 onAccept={handleAgreementAccepted}
 onClose={handleAgreementDeclined}
 />
 </>
 );
 }

 // ── 4. Check role access ─────────────────────────────────────────────────
 if (role && allowedRoles && !allowedRoles.includes(role)) {
 return <Navigate to={getDashboardPath(role)} replace />;
 }

 return children;
}
