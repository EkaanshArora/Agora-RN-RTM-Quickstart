import React, {Component} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import RtmEngine from 'agora-react-native-rtm';

const APP_ID = ''; //*ENTER APP ID HERE*
const channel = 'channel-x';
let localUid;
let engine;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {login: false, message: [{'0': 'test msg'}], inText: ''};
  }
  onSend = async msg => {
    await engine.sendMessageByChannelId(channel, msg);
    this.setState({message: [...this.state.message, {[localUid]: msg}]});
  };

  init = async () => {
    engine = new RtmEngine();
    localUid = `${+new Date()}`;
    console.log('create RTM engine: ', engine);
    engine.on('error', evt => {
      console.log(evt);
    });
    engine.on('channelMessageReceived', evt => {
      let {uid, channelId, text, ts} = evt;
      console.log(evt);
      if (channelId === channel) {
        this.setState({message: [...this.state.message, {[localUid]: text}]});
      }
    });
    engine.on('channelMemberLeft', evt =>
      console.log('User leave callback: ', evt),
    );
    await engine.createClient(APP_ID).catch(e => console.log(e));
    await engine.login({uid: localUid}).catch(e => console.log(e));
    await engine.joinChannel(channel).catch(e => console.log(e));
    console.log('RTM Joined channel: ', channel, '- as: ', localUid);
    this.setState({login: true});
  };

  end = async () => {
    await engine.logout().catch(e => console.log(e));
    console.log('logout done');
    await engine.destroyClient().catch(e => console.log(e));
    this.setState({login: false});
    console.log('RTM cleanup done.', engine);
  };

  render() {
    return APP_ID === '' ? (
      <Text>Please add APP ID to the App.js line 12</Text>
    ) : (
      <View style={styles.max}>
        <View style={styles.buttonHolder}>
          <TouchableOpacity
            title="Join Channel"
            onPress={this.init}
            style={this.state.login ? styles.buttonDisabled : styles.button}
            disabled={this.state.login}>
            <Text style={styles.buttonText}> Join Chat </Text>
          </TouchableOpacity>
          <TouchableOpacity
            title="Leave Channel"
            onPress={this.end}
            style={!this.state.login ? styles.buttonDisabled : styles.button}
            disabled={!this.state.login}>
            <Text style={styles.buttonText}> End Chat</Text>
          </TouchableOpacity>
        </View>
        {this.state.login ? (
          <>
            <View style={{flex: 12}}>
              <ScrollView>
                {this.state.message.map((uid, index) => {
                  return Object.keys(uid)[0] !== localUid ? (
                    <Text
                      style={{height: 30, backgroundColor: '#55aaff'}}
                      key={index}>
                      Rec: {Object.values(uid)[0]}
                    </Text>
                  ) : (
                    <Text
                      style={{height: 30, backgroundColor: '#55ffaa'}}
                      key={index}>
                      Sent: {Object.values(uid)[0]}
                    </Text>
                  );
                })}
              </ScrollView>
            </View>
            <TextInput
              style={{flex: 1, borderWidth: 2}}
              onChangeText={t => this.setState({inText: t})}
            />
            <Button
              title="Send"
              onPress={() => this.onSend(this.state.inText)}
            />
          </>
        ) : (
          <></>
        )}
      </View>
    );
  }
}

export default App;

const styles = {
  max: {
    flex: 1,
  },
  buttonHolder: {
    height: 100,
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0093E9',
    borderRadius: 25,
  },
  buttonDisabled: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#aaddff',
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
  },
};
