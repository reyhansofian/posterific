import React, { Component } from 'react';
import { TouchableOpacity, View, Image, Text, StyleSheet } from 'react-native';
import {
  LoginButton,
  AccessToken,
  GraphRequest,
  GraphRequestManager
} from 'react-native-fbsdk';

import storage from '../Model/PosterificStorage';
import UserModel from '../Model/UserModel';

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Image
        resizeMode="cover"
        source={require('./../assets/images/login-splash-bg.jpg')}
        style={styles.splashContainer}
      >
        <Text style={styles.mainTitle}>Posterific!</Text>
        <Text style={styles.subTitle}>Poster making made easy.</Text>

        <LoginButton
          onLoginFinished={(error, result) => {
            if (error) {
              alert('login has error: ' + result.error);
            } else if (result.isCancelled) {
              alert('login is cancelled.');
            } else {
              let tmpThis = this;
              AccessToken.getCurrentAccessToken().then(data => {
                if (!data) {
                  console.warn('No access token available');
                } else {
                  console.log(`Got access token ${data.accessToken}`);
                  console.log(`Permissions ${data.permissions}`);
                  const graphPath = '/me?fields=id,first_name,picture{url}';
                  const requestHandler = (error, result) => {
                    if (!error) {
                      console.log(
                        `Result is ${result.id}, ${result.first_name}, ${result
                          .picture.data.url}`
                      );
                      const user = new UserModel(
                        result.id,
                        result.first_name,
                        result.picture.data.url
                      );
                      console.log('USERRRR', user);

                      storage.save({
                        key: 'user',
                        data: {
                          user: {
                            id: user.id,
                            firstName: user.firstName,
                            profileImageUri: user.profileImageUri
                          }
                        }
                      });

                      tmpThis.props.navigator.push({
                        name: 'PosterList'
                      });
                    }
                  };

                  const userInfoRequest = new GraphRequest(
                    graphPath,
                    null,
                    requestHandler
                  );
                  new GraphRequestManager().addRequest(userInfoRequest).start();
                }
              });
            }
          }}
          onLogoutFinished={() => {
            storage.remove({ key: 'user' });
            this.props.navigator.popToTop();
          }}
        />

        <TouchableOpacity
          onPress={() => {
            this.props.navigator.push({
              name: 'PosterList'
            });
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              width: 180,
              height: 28,
              backgroundColor: '#4167ae',
              borderRadius: 3,
              margin: 20
            }}
          >
            <Text style={{ margin: 3, color: 'white', fontWeight: 'bold' }}>
              Get Started
            </Text>
          </View>
        </TouchableOpacity>
      </Image>
    );
  }
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column'
  },
  mainTitle: {
    fontSize: 72,
    color: 'white'
  },
  subTitle: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    fontSize: 18,
    color: 'white',
    marginBottom: 50
  }
});
