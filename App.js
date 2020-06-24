import React, {Component} from 'react';
import {View, Text, TextInput, Button, ScrollView} from 'react-native';
import RtmAdapter from './src/rtm-adapter';

const channel = 'x';
const engine = new RtmAdapter();
const localUid = `${+new Date()}`;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {login: false, message: [{'0': 'test msg'}], inText: ''};
  }
  componentDidMount() {
    engine.client.on('error', evt => {
      console.log(evt);
    });
    engine.client.on('channelMessageReceived', evt => {
      const {uid, channelId, text} = evt;
      console.log(evt);
      if (channelId === channel) {
        this.setState({message: [...this.state.message, {[uid]: text}]});
      }
    });
    engine.login(localUid).then(() => {
      engine.join(channel).then(() => {
        console.log('join channel success');
        this.setState({login: true});
      });
    });
  }
  onSend = msg => {
    console.log('send: ', msg);
    engine
      .sendChannelMessage({
        channel: channel,
        message: msg,
      })
      .then(() => {
        this.setState({message: [...this.state.message, {[localUid]: msg}]});
      });
  };
  render() {
    return this.state.login ? (
      <View style={{flex: 1}}>
        <Text style={{height: 30, textAlign: 'center', lineHeight: 30}}>
          RTM Demo
        </Text>
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
        <Button title="Send" onPress={() => this.onSend(this.state.inText)} />
      </View>
    ) : (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }
}

export default App;
