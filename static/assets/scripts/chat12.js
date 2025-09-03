let text2 = document.querySelector('.msger-input');
let user_id = document.getElementById('user_id22');
let sound = document.getElementById('sound_sms')




function send_messge() {

    let text = document.querySelector('.msger-input');

    if (text.value.length >  0){

        $.ajax({
            type: 'GET',
            url: '/chat_sestem/send_message/',
            data: {
                text: text.value,
                user_id: user_id
            },
            success: function (res) {
                send_real_time();
                sound.play()
            }
        });
    }

    }



function answer_user() {
    let text = document.querySelector('.msger-input');

    $.ajax({
        type: 'GET',
        url: '/chat_sestem/send_admin_message/',
        data: {
            text: text.value,
            user_id: user_id.innerHTML,
        },
        success: function (res) {
            send_real_time();
            text2.value = '';
        }
    });
}

function send_real_time() {
    let messageTime = new Date().toLocaleTimeString();

    let div1 = document.createElement('div');
    let div2 = document.createElement('div');
    let div3 = document.createElement('div');
    let div4 = document.createElement('div');
    let div5 = document.createElement('div');
    let div6 = document.createElement('div');
    let div7 = document.createElement('div');

    div1.setAttribute('class', 'msg right-msg');
    div2.setAttribute('class', 'msg-img');
    div2.style.cssText = 'background-image: url(/media/images/user.png)'
    div3.setAttribute('class', 'msg-bubble');
    div4.setAttribute('class', 'msg-info');
    div5.setAttribute('class', 'msg-info-name');
    div6.setAttribute('class', 'msg-info-time');
    div6.textContent = messageTime;
    div7.setAttribute('class', 'msg-text');
    div7.textContent = text2.value;

    div4.appendChild(div5);
    div4.appendChild(div6);
    div3.appendChild(div4);
    div3.appendChild(div7);
    div1.appendChild(div2);
    div1.appendChild(div3);

    let chatArea = document.querySelector('.msger-chat');
    chatArea.appendChild(div1);

    text2.value = '';
    chatArea.scrollTop = chatArea.scrollHeight;
}


document.body.addEventListener('keypress',function(event){


    if (event.keyCode == 13){

        send_messge()

    }



})


document.body.addEventListener('keypress',function(event){


    if (event.keyCode == 13){

     answer_user()

    }



})