import React, { useEffect, useState } from "react";
import { BrowserRouter, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LoggedInLayout from "../layout";
import HomePage from "../pages/HomePage";
import TicketResponsiveContainer from "../pages/TicketResponsiveContainer";
import Signup from "../pages/Signup/";
// import SignupCheckout from "../pages/Signup/Checkout"; // Checkout transparente desabilitado
import SignupSuccess from "../pages/Signup/Success";
import SignupFailure from "../pages/Signup/Failure";
import SignupPending from "../pages/Signup/Pending";
import SetupAutoRenew from "../pages/Signup/SetupAutoRenew";
import Login from "../pages/Login/";
import Connections from "../pages/Connections/";
import SettingsCustom from "../pages/SettingsCustom/";
import Financeiro from "../pages/Financeiro/";
import Users from "../pages/Users";
import Contacts from "../pages/Contacts/";
import Queues from "../pages/Queues/";
import Tags from "../pages/Tags/";
import MessagesAPI from "../pages/MessagesAPI/";
import Helps from "../pages/Helps/";
import ContactLists from "../pages/ContactLists/";
import ContactListItems from "../pages/ContactListItems/";
// import Companies from "../pages/Companies/";
import QuickMessages from "../pages/QuickMessages/";
import Kanban from "../pages/Kanban";
import { AuthProvider } from "../context/Auth/AuthContext";
import ThemeWithModules from "../components/ThemeWithModules";
import { TicketsContextProvider } from "../context/Tickets/TicketsContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";
import { TourProvider } from "../context/Tour/TourContext";
import Route from "./Route";
import Schedules from "../pages/Schedules";
import Campaigns from "../pages/Campaigns";
import CampaignsConfig from "../pages/CampaignsConfig";
import CampaignReport from "../pages/CampaignReport";
import Annoucements from "../pages/Annoucements";
import Chat from "../pages/Chat";
import ToDoList from "../pages/ToDoList/";
import Subscription from "../pages/Subscription/";
import Files from "../pages/Files/";
import Prompts from "../pages/Prompts";
import QueueIntegration from "../pages/QueueIntegration";
import ForgetPassword from "../pages/ForgetPassWord/"; // Reset PassWd
import CampaignsPhrase from "../pages/CampaignsPhrase";
import FlowBuilder from "../pages/FlowBuilder";
import FlowBuilderConfig from "../pages/FlowBuilderConfig";
import Landing from "../pages/Landing";
import CustomProposalForm from "../pages/Landing/CustomProposalForm";
import Forms from "../pages/Forms";
import FormBuilder from "../pages/Forms/FormBuilder";
import PublicForm from "../pages/Forms/PublicForm";
import MesaRedirect from "../pages/MesaRedirect";
import FormResponses from "../pages/Forms/FormResponses";
import OrderHistory from "../pages/Forms/OrderHistory";
import OrderQueue from "../components/OrderQueue";
import FormAnalytics from "../pages/Forms/FormAnalytics";
import SubscriptionExpired from "../pages/SubscriptionExpired";
import QuickAccessButtonsSettings from "../pages/QuickAccessButtonsSettings";
import Products from "../pages/Products";
import Pedidos from "../pages/Pedidos";
import Mesas from "../pages/Mesas";
import LanchonetesHub from "../pages/LanchonetesHub";
import Garcom from "../pages/Garcom";
import Cozinha from "../pages/Cozinha";
import Entregador from "../pages/Entregador";

const Routes = () => {
  const [showCampaigns, setShowCampaigns] = useState(false);

  useEffect(() => {
    const cshow = localStorage.getItem("cshow");
    if (cshow !== undefined) {
      setShowCampaigns(true);
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeWithModules>
        <TourProvider>
          <TicketsContextProvider>
            <Switch>
            <Route exact path="/" component={Landing} />
            <Route exact path="/proposta-personalizada" component={CustomProposalForm} isPublic={true} />
            <Route exact path="/f/:slug" component={PublicForm} isPublic={true} />
            <Route exact path="/mesa/:mesaId" component={MesaRedirect} isPublic={true} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/signup" component={Signup} />
            {/* <Route exact path="/signup/checkout" component={SignupCheckout} /> Checkout transparente desabilitado */}
            <Route exact path="/signup/success" component={SignupSuccess} />
            <Route exact path="/signup/failure" component={SignupFailure} />
            <Route exact path="/signup/pending" component={SignupPending} />
            <Route exact path="/signup/setup-auto-renew" component={SetupAutoRenew} />
            <Route exact path="/forgetpsw" component={ForgetPassword} />
            {/* <Route exact path="/create-company" component={Companies} /> */}
            <Route exact path="/subscription-expired" component={SubscriptionExpired} isPrivate allowExpired />
            <WhatsAppsProvider>
              <LoggedInLayout>
                <Switch>
                <Route exact path="/dashboard" component={HomePage} isPrivate />
                <Route
                  exact
                  path="/tickets/:ticketId?"
                  component={TicketResponsiveContainer}
                  isPrivate
                />
                <Route
                  exact
                  path="/connections"
                  component={Connections}
                  isPrivate
                />
                <Route
                  exact
                  path="/quick-messages"
                  component={QuickMessages}
                  isPrivate
                />
                <Route exact path="/todolist" component={ToDoList} isPrivate />
                <Route
                  exact
                  path="/quick-access-buttons-settings"
                  component={QuickAccessButtonsSettings}
                  isPrivate
                />
                <Route
                  exact
                  path="/schedules"
                  component={Schedules}
                  isPrivate
                />
                <Route exact path="/tags" component={Tags} isPrivate />
                <Route exact path="/contacts" component={Contacts} isPrivate />
                <Route exact path="/helps" component={Helps} isPrivate />
                <Route exact path="/users" component={Users} isPrivate />
                <Route exact path="/files" component={Files} isPrivate />
                <Route exact path="/products" component={Products} isPrivate />
                <Route exact path="/lanchonetes" component={LanchonetesHub} isPrivate />
                <Route exact path="/garcom" component={Garcom} isPrivate />
                <Route exact path="/cozinha" component={Cozinha} isPrivate />
                <Route exact path="/entregador" component={Entregador} isPrivate />
                <Route exact path="/prompts" component={Prompts} isPrivate />
                <Route
                  exact
                  path="/queue-integration"
                  component={QueueIntegration}
                  isPrivate
                />

                <Route
                  exact
                  path="/messages-api"
                  component={MessagesAPI}
                  isPrivate
                />
                <Route
                  exact
                  path="/settings"
                  component={SettingsCustom}
                  isPrivate
                />
                <Route exact path="/kanban" component={Kanban} isPrivate />
                <Route exact path="/pedidos" component={Pedidos} isPrivate />
                <Route exact path="/mesas" component={Mesas} isPrivate />
                <Route
                  exact
                  path="/financeiro"
                  component={Financeiro}
                  isPrivate
                />
                <Route exact path="/queues" component={Queues} isPrivate />
                <Route
                  exact
                  path="/announcements"
                  component={Annoucements}
                  isPrivate
                />
                <Route
                  exact
                  path="/subscription"
                  component={Subscription}
                  isPrivate
                />
                <Route exact path="/chats/:id?" component={Chat} isPrivate />
                {showCampaigns && (
                  <Switch>
                    <Route
                      exact
                      path="/contact-lists"
                      component={ContactLists}
                      isPrivate
                    />
                    <Route
                      exact
                      path="/contact-lists/:contactListId/contacts"
                      component={ContactListItems}
                      isPrivate
                    />
                    <Route
                      exact
                      path="/campaigns"
                      component={Campaigns}
                      isPrivate
                    />
                    <Route
                      exact
                      path="/campaign/:campaignId/report"
                      component={CampaignReport}
                      isPrivate
                    />
                    <Route
                      exact
                      path="/campaigns-config"
                      component={CampaignsConfig}
                      isPrivate
                    />

                    <Route
                      exact
                      path="/phrase-lists"
                      component={CampaignsPhrase}
                      isPrivate
                    />
                    <Route
                      exact
                      path="/flowbuilders"
                      component={FlowBuilder}
                      isPrivate
                    />
                    <Route
                      exact
                      path="/flowbuilder/:id?"
                      component={FlowBuilderConfig}
                      isPrivate
                    />
                    <Route
                      exact
                      path="/forms"
                      component={Forms}
                      isPrivate
                    />
                    <Route
                      exact
                      path="/forms/new"
                      component={FormBuilder}
                      isPrivate
                    />
                    <Route
                      exact
                      path="/forms/:id"
                      component={FormBuilder}
                      isPrivate
                    />
                    <Route
                      exact
                      path="/forms/:formId/responses"
                      component={FormResponses}
                      isPrivate
                    />
                    <Route
                      exact
                      path="/forms/:formId/historico-pedidos"
                      component={OrderHistory}
                      isPrivate
                    />
                    <Route
                      exact
                      path="/forms/:formId/fila-pedidos"
                      component={OrderQueue}
                      isPrivate
                    />
                    <Route
                      exact
                      path="/forms/:formId/analytics"
                      component={FormAnalytics}
                      isPrivate
                    />
                  </Switch>
                )}
                </Switch>
              </LoggedInLayout>
            </WhatsAppsProvider>
          </Switch>
          <ToastContainer autoClose={3000} />
        </TicketsContextProvider>
        </TourProvider>
        </ThemeWithModules>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;
