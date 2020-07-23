import React from 'react';
import '../App.css';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import Views from './Views';
import Upload from './Upload';

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

export default withAuthenticator(App);
