import React from 'react';
import '../App.css';
import { AmplifySignOut } from '@aws-amplify/ui-react';
import Views from './Views';
import Upload from './Upload';
import { ConfirmSignIn, ForgotPassword, RequireNewPassword, SignIn, VerifyContact, withAuthenticator } from 'aws-amplify-react';
function App() {
  return (
    <div className="App container-fluid">
      <Upload fleet="ra" />
      <Upload fleet="rse" />
      <Upload fleet="snoo" />
      <Upload fleet="rising" />
      <Upload fleet="mirror" />
      <Views />
      <AmplifySignOut />
    </div>      
  );
}

export default withAuthenticator(App, false, [<SignIn />, <ConfirmSignIn />, <ForgotPassword />, <RequireNewPassword />, <VerifyContact />]);
