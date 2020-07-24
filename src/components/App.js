import React from 'react';
import '../App.css';
import { AmplifySignOut, AmplifyAuthenticator, AmplifySignIn } from '@aws-amplify/ui-react';
import Views from './Views';
import Upload from './Upload';

function App() {
  return (
    <div className="App container-fluid">
      <AmplifyAuthenticator>
      <div slot="sign-in"  className="align-items-center d-flex min-vh-100 justify-content-center">
          <AmplifySignIn hideSignUp="true" />
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
