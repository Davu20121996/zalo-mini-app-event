import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/layout";
import { getBasePath } from "./utils/zma";
import HomePage from "./pages/home";
import EventsPage from "./pages/events";
import ProfilePage from "./pages/profile";
import EventDetailPage from "./pages/event-detail";
import EventRegisterPage from "./pages/event-register";
import TicketPage from "./pages/ticket";
import VouchersPage from "./pages/vouchers";
import PersonalInfoPage from "./pages/profile/personal-info";
import { copy } from "@/constants/copy";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      children: [
        { path: "/", element: <HomePage />, handle: { hideCart: true } },
        {
          path: "/events",
          element: <EventsPage />,
          handle: {
            title: copy.nav.menu,
            back: false,
            whiteBackground: true,
            headerPosition: "sticky",
            hideCart: true,
          },
        },
        {
          path: "/profile",
          element: <ProfilePage />,
          handle: {
            title: copy.header.profile,
            back: false,
            whiteBackground: true,
            headerPosition: "sticky",
            hideCart: true,
          },
        },
        {
          path: "/profile/personal-info",
          element: <PersonalInfoPage />,
          handle: {
            title: copy.profile.personalProfile,
            back: true,
            whiteBackground: true,
            headerPosition: "sticky",
            hideCart: true,
          },
        },
        {
          path: "/profile/vouchers",
          element: <VouchersPage />,
          handle: {
            title: copy.profile.vouchers,
            back: true,
            whiteBackground: true,
            headerPosition: "sticky",
            hideCart: true,
          },
        },
        {
          path: "/event/:id",
          element: <EventDetailPage />,
          handle: {
            hideHeader: true,
            hideCart: true,
          },
        },
        {
          path: "/event/:id/register",
          element: <EventRegisterPage />,
          handle: {
            title: copy.event.register,
            back: true,
            whiteBackground: true,
            headerPosition: "sticky",
            hideCart: true,
          },
        },
        {
          path: "/ticket",
          element: <TicketPage />,
          handle: {
            title: copy.event.myTicket,
            back: true,
            whiteBackground: true,
            headerPosition: "sticky",
            hideCart: true,
          },
        },
      ],
    },
  ],
  {
    basename: getBasePath(),
  },
);

export default router;
