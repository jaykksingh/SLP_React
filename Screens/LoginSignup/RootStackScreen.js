import React from 'react';


import {createStackNavigator } from '@react-navigation/stack';

import SignInScreen from '../LoginSignup/SignInScreen';
import SignUpScreen from '../LoginSignup/SignUpScreen';
// import ForgotPasswordScreen from '../LoginSignup/ForgotPasswordScreen';
import PrivacyAndTermsScreen from '../LoginSignup/PrivacyAndTermsScreen';

const RootStack = createStackNavigator();

const RootStackScreen = ({ navigation}) => (
    <RootStack.Navigator 
        screenOptions={{
            headerShown:false,
            headerStyle: { elevation: 0 },
            cardStyle: { backgroundColor: 'black' }
        }}>
        {/* <RootStack.Screen name= "SplashScreen" component={SplashScreen} /> */}
        <RootStack.Screen name="SignInScreen" component={SignInScreen} />
        <RootStack.Screen name="SignUpScreen" component={SignUpScreen} />
        {/* <RootStack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} /> */}
        <RootStack.Screen name="PrivacyAndTerms" component={PrivacyAndTermsScreen} />

    </RootStack.Navigator>
);

export default RootStackScreen;