import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "../pages/landing/Landing";

import Overview from "../pages/dashboard/Overview";
import WebsiteScanner from "../pages/dashboard/WebsiteScanner";
import Reports from "../pages/dashboard/Reports";
import NetworkScanner from "../pages/dashboard/NetworkScanner";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
// import VerifyOTP from "../pages/auth/VerifyOTP";
import DashboardLayout from "../layouts/DashboardLayout";


const AppRouter = () => {

return (

<BrowserRouter>

<Routes>


<Route path="/" element={<Landing/>}/>


<Route
path="/dashboard"
element={<Navigate to="/dashboard/overview" replace/>}
/>



<Route
path="/dashboard/overview"
element={
<DashboardLayout>
<Overview/>
</DashboardLayout>
}
/>

<Route 
  path="/login" 
  element={<Login />} 
/>


<Route
 path="/signup"
 element={<Signup />}
/>

{/* <Route 
  path="/verify-otp" 
  element={<VerifyOTP />} 
/>  */}

<Route
path="/dashboard/website-scanner"
element={
<DashboardLayout>
<WebsiteScanner/>
</DashboardLayout>
}
/>



<Route
path="/dashboard/network-scanner"
element={
<DashboardLayout>
<NetworkScanner/>
</DashboardLayout>
}
/>



<Route
path="/dashboard/reports"
element={
<DashboardLayout>
<Reports/>
</DashboardLayout>
}
/>



</Routes>

</BrowserRouter>

);

};


export default AppRouter;