import React, { useEffect, useState } from "react";
import SockJs from "sockjs-client";
import StompJs from "stompjs";
import styled from "styled-components";
import Button from "./Button";
import Navigation from "./Navigation";
import Setting from "./Setting";
import Character from "./Character";
import { useSelector, useDispatch } from "react-redux";
import { updateUsers, settingRoom, changeCharacter,startGame, exit, vote, result, countDown } from "../modules/room";
import { characterpop } from "../modules/character";
import Change from "./ChageCharacter";
import {CgCrown } from "react-icons/cg";
import { useHistory } from "react-router-dom";
import { popup } from "../modules/popup";


const Wrap = styled.div`
  position: relative;
  width: 100vh;
  max-width: 390px;
  height: 100vh;
  background: #0f0c13;
  margin: 0 auto;
`;

const RoomInfo = styled.div`
  display: flex;
  height: 30px;
  margin: 0 20px 40px 20px;
  justify-content:space-around;
  .text{
    font-family: 'Do Hyeon';
font-style: normal;
font-weight: 400;
font-size: 32px;
line-height: 80.5px;
text-align: center;

color: #53A6C8;
  }
  .number{
    font-family: 'Do Hyeon';
    font-style: normal;
    font-weight: 400;
    font-size: 55px;
    line-height: 69px;
    text-align: center;
    color: #53A6C8;
  }

`;
const RoomSubInfo = styled.div`
margin-bottom:50px;
p{
  font-family: 'Roboto';
font-style: normal;
font-weight: 400;
font-size: 18px;
text-align: center;

color: #757575;
}
@media screen and (max-width:500px){
  margin-bottom:30px;
}
`

const Content = styled.div`
  width: 100%;
  height: 45.2vh;
  display: flex;
  padding: 0 5%;
  margin: 0 auto;
  flex-wrap: wrap;
  justify-content: space-around;

  overflow-y: scroll;

  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Footer = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const HostIcon = styled(CgCrown)`
position:absolute;
left:35px;
bottom:70px;
color: #FFFF36;
width: 3em;
height: 3em;
`
const Host = styled.div`
position:relative;
width: 120px;
height: 120px;
`

const WaitingRoomContainer = () => {

  const [topic, setTopic] = useState("랜덤");
  const [timeLimit, setTimeLimit] = useState(10);

  const [character, setCharacter] = useState();

  const { Rooms } = useSelector((state) => ({
    Rooms: state.room,
  }));

    //socket 연결
    const sock = new SockJs("http://localhost:8080/socket");

    //stomp 연결
    const stomp = StompJs.over(sock);

  const dispatch = useDispatch();

  React.useEffect(() => {
    stompConnect();
  },[]);

  function stompConnect() {
    stomp.connect({}, () => {
      //유저 개인에게 보내는 응답
      stomp.subscribe(`/sub/game/error/${Rooms.data.userId}`, (body) => {
        let data = JSON.parse(body.body);
        alert(data.message);
      });

      //유저가 대기실에 들어왔을 때 이벤트
      stomp.subscribe(
        `/sub/game/enter/${Rooms.data.gameRoom.roomId}`,
        (body) => {
          let data = JSON.parse(body.body);
          console.log(Rooms.data.gameRoom.users.nickname)
          dispatch(updateUsers(data.data));
        }
      );

      //게임 설정이 변경되었을 때 이벤트
      stomp.subscribe(
        `/sub/game/setting/${Rooms.data.gameRoom.roomId}`,
        (body) => {
          let data = JSON.parse(body.body);
          dispatch(settingRoom(data.data.topic, data.data.timeLimit));
        }
      );

      //대기실 유저 중 프로필 변경이 발생했을 때 이벤트
      stomp.subscribe(
        `/sub/game/profile/${Rooms.data.gameRoom.roomId}`,
        (body) => {
          let data = JSON.parse(body.body);
          console.log(data);

          dispatch(changeCharacter(data.data));

        }
      );

      //유저가 대기실에서 나갔을 때 이벤트
      stomp.subscribe(
        `/sub/game/leave/${Rooms.data.gameRoom.roomId}`,
        (body) => {
          let data = JSON.parse(body.body);
          dispatch(updateUsers(data.data));
        }
      );
      //게임이 시작됐을때 이벤트
      stomp.subscribe(
        `/sub/game/start/${Rooms.data.gameRoom.roomId}`,
        (body) => {
          let data = JSON.parse(body.body);
          dispatch(startGame(data.data));
        }
      );
      stomp.subscribe(`/sub/game/countdown/${Rooms.data.gameRoom.roomId}`, (body) => {
        let data = JSON.parse(body.body);
        if(data.data.count == 0)dispatch(countDown(data.data));
      });
      stomp.subscribe(`/sub/game/vote/${Rooms.data.gameRoom.roomId}`, 
      (body)=>{
        let data = JSON.parse(body.body);  
        dispatch(vote(data.data));
    });
    stomp.subscribe(`/sub/game/result/${Rooms.data.gameRoom.roomId}`, (body)=>{
      let data = JSON.parse(body.body); 
      dispatch(result(data.data)); 
  });
  
    });
  }


  const { PopUp } = useSelector((state) => ({
    PopUp: state.popup.PopUp,
  })); //초기값 false;


  const {CharacterPop} =useSelector((state)=> ({
    CharacterPop: state.characterpop.CharacterPop,
  }));

  

  function sendSetting() {
    stomp.send(
      "/pub/game/setting",
      {},
      JSON.stringify({
        roomId: Rooms.data.gameRoom.roomId,
        userId: Rooms.data.userId,
        setting: {
          timeLimit: timeLimit,
          capacity: 10,
          topic: topic,
        },
      })
    );
  }

  function changeUserProfile() {
    stomp.send(
      "/pub/game/profile",
      {},
      JSON.stringify({
        roomId: Rooms.data.gameRoom.roomId,
        userId: Rooms.data.userId,
        character: character,
      })
    );
  }

  function StartGame() {
    stomp.send(
      "/pub/game/start",
      {},
      JSON.stringify({
        roomId: Rooms.data.gameRoom.roomId,
        userId: Rooms.data.userId,
      })
    )
  }

  function disconnect() {
    stomp.disconnect(() => {
      console.log("socket연결 해제");
    });
  }

  function sendLeave() {
    stomp.send(
      `/pub/game/leave`,
      {},
      JSON.stringify({
        roomId: Rooms.data.gameRoom.roomId,
        userId: Rooms.data.userId,
      })
    );
    disconnect();
  }


  const OnclickPopUp = () => {
    dispatch(popup());
  };

  const OnclickCharacter = () => {
    dispatch(characterpop());
  };

  const OnClickSetting = () => {
    sendSetting();
    OnclickPopUp();
  };

  const OnClickChangeProfile = () => {
    changeUserProfile();
    OnclickCharacter();
  }

  const OnClickStartGame = () => {
    StartGame();
  }

  const history = useHistory();

  useEffect(() => {
    window.addEventListener('beforeunload', (event) => {
      event.preventDefault();
  
      event.returnValue = sendLeave();
    })
    let unlisten = history.listen((location) => {
      if (history.action === 'PUSH') {
      }
      if (history.action === 'POP') {
      }
    });

    return () => {
      unlisten();
    };
  }, [history]);



  return (
    <Wrap>
      <Navigation
        PopUp={PopUp}
        CharacterPop={CharacterPop}
        OnclickPopUp={OnclickPopUp}
        OnclickCharacter={OnclickCharacter}
        sendLeave={sendLeave}
      />

      {PopUp ? (
        <Setting setTopic={setTopic} setTimeLimit={setTimeLimit}></Setting>
      ) :CharacterPop ? (
        <Change setCharacter={setCharacter}/>
      ) :(

        <>
          <RoomInfo>
            <span className="text">방 코드</span>
            <span className="number">
              {Rooms.isLoading || Rooms.error ? (
                <></>
              ) : (
                Rooms.data.gameRoom.roomId
              )}
            </span>
          </RoomInfo>
          <RoomSubInfo>
          <p>원활한 플레이는 3명부터 가능합니다</p>
          </RoomSubInfo>
          <Content>
            {Rooms.isLoading || Rooms.error ? (
              <></>
            ) : (
                Rooms.data.gameRoom.users.map((user, i) => (
                  user.role == "host" ? 
                  <Host>
                    <HostIcon/>
                  <Character
                    key={i}
                    src={"/img/character-" + user.character + ".png"}
                    width="100px"
                    height="100px"
                    nickName={user.nickname}
                  />
                  </Host>
                  : <Character
                  key={i}
                  src={"/img/character-" + user.character + ".png"}
                  width="100px"
                  height="100px"
                  nickName={user.nickname}
                />
                ))
              
            )}
          </Content>
        </>
        
      )}
      <Footer>
        {PopUp ? (
          <Button value="확인" OnClick={OnClickSetting} />
        ) :CharacterPop ? (
          <Button value="변경" OnClick = {OnClickChangeProfile}/>

        ) : (
          <Button value="게임 시작" OnClick={OnClickStartGame}/>
        )}
      </Footer>
    </Wrap>
  );
};

export default WaitingRoomContainer;
