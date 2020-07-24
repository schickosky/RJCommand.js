import React from 'react';
import '../App.css';
import { AmplifySignOut, AmplifyAuthenticator, AmplifySignIn, AmplifyForgotPassword, AmplifyConfirmSignIn, AmplifyRequireNewPassword, AmplifyVerifyContact, AmplifyGreetings } from '@aws-amplify/ui-react';
import Views from './Views';
import Upload from './Upload';

function App() {
  return (
    <div className="App container-fluid">
      <AmplifyAuthenticator>
        <div slot="sign-in" className="align-items-center d-flex min-vh-100 justify-content-center">
          <AmplifySignIn hideSignUp="true" />
        </div>
        <div slot="forgot-password" className="align-items-center d-flex min-vh-100 justify-content-center">
          <AmplifyForgotPassword />
        </div>
        <div slot="confirm-sign-in" className="align-items-center d-flex min-vh-100 justify-content-center">
          <AmplifyConfirmSignIn />
        </div>
        <div slot="require-new-password" className="align-items-center d-flex min-vh-100 justify-content-center">
          <AmplifyRequireNewPassword />
        </div>
        <div slot="verify-contact" className="align-items-center d-flex min-vh-100 justify-content-center">
          <AmplifyVerifyContact />
        </div>
        <div slot="greetings" className="align-items-center d-flex min-vh-100 justify-content-center">
          <AmplifyGreetings />
        </div>
        <Upload fleet="ra" />
        <Upload fleet="rse" />
        <Upload fleet="snoo" />
        <Upload fleet="rising" />
        <Upload fleet="mirror" />
        <Views />
      <AmplifySignOut />
      </AmplifyAuthenticator>
    </div>      
  );
}

export default App;
