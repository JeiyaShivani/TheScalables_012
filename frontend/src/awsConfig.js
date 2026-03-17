// src/awsConfig.js
import * as AmplifyModules from 'aws-amplify';
const Amplify = AmplifyModules.default || AmplifyModules;
const Auth = AmplifyModules.Auth;

Amplify.configure({
  Auth: {
    // REQUIRED - Amazon Cognito User Pool ID
    userPoolId: 'ap-south-1_QWHkZVL2m',
    // REQUIRED - Amazon Cognito Web Client ID
    userPoolWebClientId: '1gq5s6tl2rsiq5lkc8kp5mc0h8',
    // REQUIRED - AWS Region
    region: 'ap-south-1',
    // OPTIONAL: remove if not using hosted UI
    // oauth: { ... } 
  }
});

// Export Auth so components can use it
export { Auth };