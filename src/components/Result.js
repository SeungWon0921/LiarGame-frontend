import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import styled from "styled-components";
import SockJs from "sockjs-client";
import StompJs from "stompjs";
import { result, vote } from "../modules/room";

const Wrap = styled.div`
position: relative;
width: 100vh;
max-width: 390px;
height: 100vh;
background: #0f0c13;
margin: 0 auto;
`;
const POPWRAP = styled.div`
position: absolute;
width: 324px;
height: 326px;
left: 33px;
top: 53px;

background: #0F0C13;
border: 15px solid #201651;
border-radius: 20px;
`
const INPUT = styled.input`
box-sizing: border-box;

position: absolute;
width: 207px;
height: 57px;
left:50%;
transform:translateX(-50%);
top:140px;

background: rgba(39, 18, 143, 0.39);
border: 2px solid #6D8487;
box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
border-radius: 50px;
font-family: 'Roboto';
font-style: normal;
font-weight: 500;
font-size: 24px;
line-height: 28px;

color: #B9B9B9;
`
const TITLE = styled.div`
position: absolute;
width: 195px;
height: 55px;
left:50%;
transform:translateX(-50%);


background: #201651;
box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
border-radius: 20px;
p{
    position:absolute;
width: 156px;
height: 18px;
left:50%;
transform:translateX(-50%);
font-family: 'Gugi';
font-style: normal;
font-weight: 400;
font-size: 28px;
line-height: 55px;
text-align: center;

color: #53A6C8;
}
`
const Btn = styled.p`{
    position: absolute;
    width: 156px;
    height: 18px;
    left: 117px;
    top: 322px;
    
    font-family: 'Do Hyeon';
    font-style: normal;
    font-weight: 400;
    font-size: 28px;
    line-height: 35px;
    text-align: center;
    
    color: #53A6C8;
}
`
const P = styled.p`
padding-top:50px;
font-family: 'Dongle';
font-style: normal;
font-weight: 400;
font-size: 80px;
line-height: 116px;
text-align: center;

color: #53A6C8;
`
const ImgArea = styled.div`
margin:0 auto;
width: 250px;
height: 250px;
left: 70px;
top: 307px;
img{
    width:100%;
}
`
const ResultImgView = styled.div`
position: absolute;
width: 200px;
height: 200px;
left: 95px;
top: 31px;
img{
    width:100%;
}
`
const ResultWrap = styled.div`
position: absolute;
width: 324px;
height: 270px;
left: 33px;
top: 304px;

background: #0F0C13;
border: 15px solid #201651;
border-radius: 20px;
`
const ViewLiar = styled.div`
display:flex;
justify-content:space-between;
position: absolute;
width: 200px;
height: 18px;
left: 50%;
transform:translateX(-50%);
top:100px;
p{
    font-family: 'Do Hyeon';
font-style: normal;
font-weight: 400;
font-size: 28px;
line-height: 35px;
text-align: center;

color: #53A6C8;
}
p+p{
    font-family: 'Roboto';
font-style: normal;
font-weight: 400;
font-size: 22px;
line-height: 35px;
text-align: center;
color: #B9B9B9;

}
`
const ViewWord = styled.div`
display:flex;
justify-content:space-between;
position: absolute;
width: 200px;
height: 18px;
left: 50%;
transform:translateX(-50%);
top:150px;
p{
    font-family: 'Do Hyeon';
font-style: normal;
font-weight: 400;
font-size: 28px;
line-height: 35px;
text-align: center;

color: #53A6C8;
}
p+p{
    font-family: 'Roboto';
font-style: normal;
font-weight: 400;
font-size: 22px;
line-height: 35px;
text-align: center;
color: #B9B9B9;

}
`
const LiarChoiceWord = styled.div`
display:flex;
justify-content:space-between;
position: absolute;
width: 200px;
height: 18px;
left: 50%;
transform:translateX(-50%);
top:200px;

p{
    font-family: 'Do Hyeon';
font-style: normal;
font-weight: 400;
font-size: 28px;
line-height: 35px;
text-align: center;

color: #53A6C8;
}
p+p{
    font-family: 'Roboto';
font-style: normal;
font-weight: 400;
font-size: 22px;
line-height: 35px;
text-align: center;
color: #B9B9B9;

}
`
const ToMain = styled.div`
box-sizing: border-box;

position: absolute;
width: 195px;
height: 55px;
left: 97px;
top: 650px;

background: #201651;
border: 1px solid rgba(0, 0, 0, 0.5);
box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25), 0px 4px 4px rgba(0, 0, 0, 0.25);
border-radius: 20px;
p{
    font-family: 'Do Hyeon';
font-style: normal;
font-weight: 400;
font-size: 32px;
line-height: 55px;
text-align: center;

color: #53A6C8;
}
`
const ResultWrap2 = styled.div`
position: absolute;
width: 324px;
height: 311px;
left: 33px;
top: 281px;

background: #0F0C13;
border: 15px solid #201651;
border-radius: 20px;
`

const Result = () => {
    const { Rooms } = useSelector((state) => ({
        Rooms: state.room,
    })); 


        //socket 연결
        const sock = new SockJs("http://3.35.178.104/socket");

        //stomp 연결
        const stomp = StompJs.over(sock);

        const dispatch = useDispatch();

        React.useEffect(() => {
            stompConnect();
        }, []);

        function stompConnect() {
            stomp.connect({}, () => {

                //유저 개인에게 보내는 응답
      stomp.subscribe(`/sub/game/error/${Rooms.data.userId}`, (body) => {
        let data = JSON.parse(body.body);
        alert(data.message);

        //이후 처리
      });

                stomp.subscribe(`/sub/game/vote/${Rooms.data.gameRoom.roomId}`, (body)=>{
                    let data = JSON.parse(body.body);  
                    dispatch(vote(data.data));
                });
      
            stomp.subscribe(`/sub/game/result/${Rooms.data.gameRoom.roomId}`, (body)=>{
              let data = JSON.parse(body.body); 
              if(Rooms.data.gameRoom.VoteSet.maxVoteCount == Rooms.data.gameRoom.VoteSet.currentVoteCount){
              dispatch(result(data.data)); 
              }
          });
        }
        )}
        const [choice, setChoice] = useState("");

    function Choice() {
        stomp.send(
          "/pub/game/choice",
          {},
          JSON.stringify({
            roomId: Rooms.data.gameRoom.roomId,
            userId: Rooms.data.userId,
            choice : choice,
          })
        );
      }
      const onChangeChoice = (e) => {
        setChoice(e.target.value);
      };

      const OnClickChoice = () => {
        Choice();
        console.log(choice);
      }


    const checkResult = () =>{
        if(Rooms.data.gameRoom.gameStatus == 'CHOICE' && Rooms.data.userId == Rooms.data.gameRoom.gameSet.liarId) return 'CHOICE_Liar'
        else if(Rooms.data.gameRoom.gameStatus == 'CHOICE' && Rooms.data.userId != Rooms.data.gameRoom.gameSet.liarId) return 'CHOICE_Player'
        if(Rooms.data.gameRoom.gameStatus == 'END' && Rooms.data.gameRoom.ResultSet.winner == 'liar' && Rooms.data.userId == Rooms.data.gameRoom.gameSet.liarId) return 'END_Liar_Win'
        else if(Rooms.data.gameRoom.gameStatus == 'END' && Rooms.data.gameRoom.ResultSet.winner == 'liar' && Rooms.data.userId != Rooms.data.gameRoom.gameSet.liarId) return 'END_Player_Lose'
        if(Rooms.data.gameRoom.gameStatus == 'END' && Rooms.data.gameRoom.ResultSet.winner == 'member' && Rooms.data.userId == Rooms.data.gameRoom.gameSet.liarId) return 'END_Member_Win'
        if(Rooms.data.gameRoom.gameStatus == 'END' && Rooms.data.gameRoom.ResultSet.winner == 'member' && Rooms.data.userId != Rooms.data.gameRoom.gameSet.liarId) return 'END_Members_Win'
    }
    return (
        <>
        {checkResult() == 'CHOICE_Liar' ? <Wrap><POPWRAP><TITLE><p>제시어 입력</p></TITLE><INPUT value={choice} onChange={onChangeChoice}></INPUT></POPWRAP><Btn onClick={()=>OnClickChoice()}>입력하기</Btn></Wrap> : checkResult() == 'CHOICE_Player' ? <Wrap><P>라이어를</P><ImgArea><img src="/img/Catch.png"/></ImgArea><P>잡았다!</P></Wrap> : checkResult() == 'END_Liar_Win' ? <Wrap><ResultImgView><img src="/img/Win.png"/></ResultImgView><ResultWrap><TITLE><p>결과</p></TITLE><ViewLiar><p>라이어</p><p>{Rooms.data.gameRoom.ResultSet.liarName}</p></ViewLiar><ViewWord><p>제시어</p><p>{Rooms.data.gameRoom.gameSet.word}</p></ViewWord></ResultWrap><ToMain><Link to='/'><p>메인으로</p></Link></ToMain></Wrap>:checkResult() == 'END_Player_Lose' ? <Wrap><ResultImgView><img src="/img/Lose.png"/></ResultImgView><ResultWrap><TITLE><p>결과</p></TITLE><ViewLiar><p>라이어</p><p>{Rooms.data.gameRoom.ResultSet.liarName}</p></ViewLiar><ViewWord><p>제시어</p><p>{Rooms.data.gameRoom.gameSet.word}</p></ViewWord></ResultWrap><ToMain><Link to='/'><p>메인으로</p></Link></ToMain></Wrap> : checkResult() == 'END_Member_Win' ? <Wrap><ResultImgView><img src="/img/Lose.png"/></ResultImgView><ResultWrap2><TITLE><p>결과</p></TITLE><ViewLiar><p>라이어</p><p>{Rooms.data.gameRoom.ResultSet.liarName}</p></ViewLiar><ViewWord><p>제시어</p><p>{Rooms.data.gameRoom.gameSet.word}</p></ViewWord><LiarChoiceWord><p>라이어의 답</p><p>{Rooms.data.gameRoom.ResultSet.liarAnswer}</p></LiarChoiceWord></ResultWrap2><ToMain><Link to='/'><p>메인으로</p></Link></ToMain></Wrap> : checkResult() == 'END_Members_Win' ? <Wrap><ResultImgView><img src="/img/Win.png"/></ResultImgView><ResultWrap><TITLE><p>결과</p></TITLE><ViewLiar><p>라이어</p><p>{Rooms.data.gameRoom.ResultSet.liarName}</p></ViewLiar><ViewWord><p>라이어의 답</p><p>{Rooms.data.gameRoom.ResultSet.liarAnswer}</p></ViewWord></ResultWrap><ToMain><Link to='/'><p>메인으로</p></Link></ToMain></Wrap> : ""}
        </>
    )
}

export default Result;