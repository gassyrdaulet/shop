import { Navigate } from "react-router-dom";
import Auth from "../pages/Auth";
import Error from "../pages/Error";
import NoOrg from "../pages/NoOrg";
import ChangePassword from "../pages/ChangePassword";
import ConfirmAccount from "../pages/ConfirmAccount";
import Goods from "../pages/Goods";
import Summary from "../pages/Summary";
import NewGood from "../pages/NewGood";
import EditGood from "../pages/EditGood";
import Delivery from "../pages/Delivery";
import Warehouse from "../pages/Warehouse";
import Acceptance from "../pages/Acceptance";
import NewAcceptance from "../pages/NewAcceptance";
import InventoryDetails from "../pages/InventoryDetails";
import NewOrder from "../pages/NewOrder";
import OrderDetails from "../pages/OrderDetails";
import EditOrder from "../pages/EditOrder";
import Settings from "../pages/Settings";
import Pickup from "../pages/Pickup";
import Cash from "../pages/Cash";
import Registration from "../pages/Registration";

export const userRoutes = [
  { path: "/goods", element: <Goods></Goods> },
  { path: "/goods/new", element: <NewGood></NewGood> },
  { path: "/goods/edit/:id", element: <EditGood></EditGood> },
  { path: "/delivery/:deliveryStatus", element: <Delivery></Delivery> },
  { path: "/cash/", element: <Cash></Cash> },
  { path: "/pickup/:orderStatus", element: <Pickup></Pickup> },
  { path: "/orders/new", element: <NewOrder></NewOrder> },
  { path: "/orders/edit/:id", element: <EditOrder></EditOrder> },
  { path: "/orders/details/:id", element: <OrderDetails></OrderDetails> },
  { path: "/warehouse/remainder", element: <Warehouse></Warehouse> },
  { path: "/warehouse/inventory/:type", element: <Acceptance></Acceptance> },
  { path: "/warehouse/new/:type", element: <NewAcceptance></NewAcceptance> },
  {
    path: "/warehouse/inventory/details/:id",
    element: <InventoryDetails></InventoryDetails>,
  },
  { path: "/summaries/summary", element: <Summary></Summary> },
  { path: "/settings/:settingstype", element: <Settings></Settings> },
  { path: "/", element: <Navigate to="/main"></Navigate> },
  { path: "/noorg", element: <Navigate to="/main"></Navigate> },
  { path: "/main", element: <Navigate to="/delivery/new"></Navigate> },
  { path: "/auth", element: <Navigate to="/"></Navigate> },
  { path: "/error", element: <Error></Error> },
  { path: "/*", element: <Navigate to="/error"></Navigate> },
];

export const userRoutes2 = [
  { path: "/noorg", element: <NoOrg></NoOrg> },
  { path: "/", element: <Navigate to="/noorg"></Navigate> },
  { path: "/auth", element: <Navigate to="/"></Navigate> },
  { path: "/error", element: <Error></Error> },
  { path: "/*", element: <Navigate to="/noorg"></Navigate> },
];

export const publicRoutes = [
  { path: "/auth", element: <Auth></Auth> },
  { path: "/registration", element: <Registration></Registration> },
  { path: "/confirm/:email", element: <ConfirmAccount></ConfirmAccount> },
  {
    path: "/changepassword",
    element: <ChangePassword></ChangePassword>,
  },
  { path: "/*", element: <Navigate to="/auth"></Navigate> },
];
