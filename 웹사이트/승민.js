//  새로운 코드 적용:승민바보
let stories = []; // 빈 배열로 시작
let clickedId;

// 서버에서 데이터를 가져와 화면에 그려주는 함수
async function renderStories() {
    const adContainer = document.getElementById('ad');
    const contextContainer = document.getElementById('context');
    
    adContainer.innerHTML = '';
    contextContainer.innerHTML = '';

    try {
        // Flask 서버의 API 호출
        const response = await fetch('/api/stories');
        stories = await response.json();

        // 가져온 데이터로 화면 그리기 (구조는 기존과 거의 동일)
        stories.forEach((story) => {
            const new2 = document.createElement('div');
            new2.innerText = story.title;
            new2.id = story.id;
            if (story.titlemaker) new2.title = story.titlemaker;

            const new3 = document.createElement('div');
            new3.className= "COM";
            new3.id = `t${story.id}`;    
            new3.style.display = 'none';

            const new4 = document.createElement('h2');
            new4.innerText = story.title;
            new3.appendChild(new4);

            if (story.titlemaker) {
                const maden = document.createElement('p');
                maden.innerText = `이야기 제작자: ${story.titlemaker}`;
                new3.appendChild(maden);
            }

            const new6 = document.createElement("p");
            new6.innerText = `🕒 ${story.Date}`;
            new3.appendChild(new6);

            story.contents.forEach(u_comment => {
                const new100 = document.createElement('div');
                new100.className ="COM";
                const p1 = document.createElement('p');
                const p2 = document.createElement('p');
                p1.innerText = u_comment[0];
                p2.innerText = u_comment[1];
                new100.appendChild(p1);
                new100.appendChild(p2);
                new3.appendChild(new100);
                new3.className = "cla";

            });

            adContainer.appendChild(new2);
            contextContainer.appendChild(new3);
        });
    } catch (error) {
        console.error("데이터 로드 실패:", error);
    }
}

// ⚠️ 기존 window.onload 부분을 아래처럼 변경 (DOM이 로드되면 서버에서 글 가져옴)
window.addEventListener('DOMContentLoaded', () => {
    renderStories();
    const savedName = sessionStorage.getItem('userName');
    const savedId = sessionStorage.getItem('userId');
    if (savedName) {
        document.getElementById("account").innerText = savedName;
        document.getElementById('login').innerText = "로그아웃";
    }
    if(savedId == "mickey"){
        document.getElementById('drop').style.display = 'block';
    }
    else{
       document.getElementById('drop').style.display = 'none'; 
    }

});

// ⭕ 새롭게 바뀐 코드
async function new1() {
    const realtext = document.getElementById("title").value.trim();
    const userName = sessionStorage.getItem('userName') || "";
    
    if (!realtext) return;

    try {
        await fetch('/api/stories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                title: realtext, 
                titlemaker: userName 
            })
        });
        
        document.getElementById("title").value = "";
        await renderStories(); // ⚠️ 이 함수가 파일 다른 곳에 정의되어 있어야 해요!
        
    } catch (error) {
        alert("글 저장에 실패했습니다.");
    }
}


document.getElementById('ad').onclick = function(e){
    if(e.target.matches('#ad > div')){
        const userName = sessionStorage.getItem('userName');
        clickedId = e.target.id;
        document.getElementById('big').style.display = 'none';
        document.getElementById("input").style.display = "block";
        const lis = document.getElementById("t" + clickedId);
        const liss = document.getElementById(clickedId);
        lis.style.display = "block";
        if(!liss.title){
        document.getElementById('delete').style.display= 'block';

        }
        else if(liss.title == userName){
        document.getElementById('delete').style.display= 'block';

        }
        


        document.getElementById('back').style.display= 'block';

    }
}

// ❌ 기존 su_bmit 함수 지우고 싹 교체!
async function su_bmit() {
    const userName = sessionStorage.getItem('userName') || "익명";
    const te = document.getElementById("text").value.trim();
    if (!te) return; // 빈 댓글 방지

    try {
        // 1. Flask 서버에 "이 글 ID에 댓글 좀 달아줘" 요청
        await fetch(`/api/stories/${clickedId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: userName, comment: te })
        });

        // 2. 입력창 비우기
        document.getElementById("text").value = "";
        
        // 3. 💥 저장 끝났으니 렌더 함수 실행해서 화면 새로 그리기!
        await renderStories();
        
        // 4. 원래 보고 있던 상세 글 상자는 계속 열어두기
        document.getElementById("t" + clickedId).style.display = "block"; 
    } catch (error) {
        alert("댓글 등록에 실패했습니다.");
    }
}

function back(){
    document.getElementById('back').style.display='none';
    document.getElementById('big').style.display='block';
    document.getElementById('input').style.display='none';
    const y = document.getElementById("t" + clickedId);
    y.style.display='none';
    document.getElementById("delete").style.display='none';



}

document.getElementById('login').onclick = function(){
    if(document.getElementById('login').innerText == "로그인"){
        window.location.href = '/bssm';}
    
    if(document.getElementById('login').innerText == "로그아웃"){
            sessionStorage.removeItem('userName');
            sessionStorage.removeItem('userId');

            document.getElementById('login').innerText = "로그인";
            alert("로그아웃 되엇습니다.");
            location.reload();
    }
    }

window.onload = function(){
    const savedName = sessionStorage.getItem('userName');
    if(savedName){
        document.getElementById("account").innerText = savedName;
    }
    if(document.getElementById('account').innerText != "비회원"){
        document.getElementById('login').innerText = "로그아웃";
    }
}

async function Delete() {
    const liss = document.getElementById(clickedId);
    if (confirm(`${liss.innerText}를 삭제하시겠습니까?`)) {
        try {
            // 1. 서버의 응답을 response 변수에 저장
            const response = await fetch(`/api/stories/${clickedId}`, { method: 'DELETE' });
            
            // 2. 💥 response.status 가 바로 백엔드가 보낸 "숫자" 그 자체입니다!
            if (response.status === 200) { 
                // 백엔드에서 return jsonify(...), 200 으로 보냈을 때
                alert("삭제되었습니다.");
                location.reload(); 
            } else if (response.status === 500) {
                // 백엔드 except 칸에서 return jsonify(...), 500 으로 보냈을 때
                alert("서버 내부 오류로 삭제하지 못했습니다.");
            } else {
                // 그 외의 알 수 없는 숫자 에러 대비 (예: 404 등)
                alert(`오류 발생 (에러 코드: ${response.status})`);
            }
            
        } catch (error) {
            // 서버가 완전히 꺼져있거나 인터넷이 끊겨서 숫자조차 못 받았을 때
            alert("서버와 통신할 수 없습니다.");
        }
    }
}

document.querySelector('h1').onclick = function(){
    location.reload();
}

async function drop() {
  if (confirm("드랍하시겠습니까?")) {
    try {
    const response = await fetch("/drop", { method: 'DELETE' });
    
    if (response.ok) {
      console.log("드랍 성공!");
      location.reload();

    } else {
      console.error("삭제 실패 (서버 에러):", response.status);
    }
  } catch (error) {
    console.error("네트워크 에러 발생:", error);

  }
}
}

document.addEventListener('contextmenu', event => event.preventDefault());

// 2. 맥 & 윈도우 개발자 도구 단축키 완전 차단
document.addEventListener('keydown', (e) => {
    // F12 차단
    if (e.key === 'F12') {
        e.preventDefault();
    }
    
    // 윈도우: Ctrl + Shift + I / J / C 차단
    // 맥(Mac): Cmd + Option + I / J / C 차단 (e.metaKey가 바로 Command 키야!)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
        e.preventDefault();
    }
    
    // 맥(Mac) 전용 사파리/크롬 단축키: Cmd + Option + I / U (소스보기) 차단
    if (e.metaKey && e.altKey && (e.key === 'i' || e.key === 'I' || e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
    }
});


let isPlaying = false;

// 🎵 플레이리스트: 원하는 유튜브 영상 ID를 여기에 쭉 나열하세요!
const songList = [
    "sLMK_GYLLE4", // 노래 1 (보내주신 노래)
    "bkVp-B-wDH4",
    "TQ8WlA2GXbk",
    "dYIT_jeUBKg",
    "pungzSAMIFM",
    "n6WaTObHRJM"

];

function toggleMusic() {
    const player = document.getElementById('hidden-player');
    const icon = document.getElementById('btn-icon');

    if (!isPlaying) {
        // 🎲 리스트 안에서 랜덤으로 인덱스(번호) 하나를 뽑습니다.
        const randomIndex = Math.floor(Math.random() * songList.length);
        const randomSongId = songList[randomIndex];

        // 안전한 nocookie 주소에 랜덤으로 뽑힌 ID를 꽂아줍니다!
        player.innerHTML = `
            <iframe width="1" height="1" 
                src="https://www.youtube-nocookie.com/embed/${randomSongId}?autoplay=1" 
                frameborder="0" 
                allow="autoplay">
            </iframe>
        `;
        icon.innerText = "⏸️"; 
        isPlaying = true;
    } else {
        // 멈출 때는 깔끔하게 비우기
        player.innerHTML = "";
        icon.innerText = "▶️"; 
        isPlaying = false;
    }
}