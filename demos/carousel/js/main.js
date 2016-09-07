window.onload = function(){
  var container = document.querySelector('.container');
  var list = document.querySelector('.list');
  var buttons = document.querySelector('.buttons').getElementsByTagName('span');
  var prev = document.querySelector('.prev');
  var next = document.querySelector('.next');
  var index = 1;
  var animated = false
  var timer;

  function hideButton(){
    buttons[index-1].className = "";
  }
  function showButton(){
    buttons[index-1].className = "active";
  }

  //图片切换动画
  function animate(offset){
    animated = true;
    var left = parseInt(list.style.left) + offset;
    var time = 300;
    var interval = 10;
    var speed = offset/(time/interval);

    function go(){
      if ((speed > 0 && parseInt(list.style.left) < left) || (speed < 0 && parseInt(list.style.left) > left)){
        list.style.left = parseInt(list.style.left) + speed + "px";
        setTimeout(go,interval);
      } else{
        if (left < -3000){
          list.style.left = -600 + "px";
        }else if (left > -600){
          list.style.left = -3000 + "px";
        } else {
          list.style.left = left + "px";
        }
        animated = false;
      }
    }
    go()

  }

  //自动播放
  function play(){
    timer = setInterval(function(){
      next.onclick();
    },3000)
  }

  //停止播放
  function stop(){
    clearInterval(timer);
  }
  //下一张按钮
  next.onclick = function(){
    hideButton();
    if (index == 5){
      index = 1;
    } else {
      index += 1;
    }
    showButton();
    if (!animated){
      animate(-600);
    }
  };
  //上一张按钮
  prev.onclick = function(){
    hideButton();
    if (index == 1){
      index = 5;
    } else {
      index -= 1;
    }
    showButton();
    if (!animated){
      animate(600);
    }
  };

  //按钮绑定事件
  for (var i = 0; i < buttons.length; i++){
    buttons[i].onclick = function(){
      if (this.className == "active"){
        return ;
      } else {
        hideButton();
        var myIndex = this.getAttribute("index");
        var offset = -600 * (myIndex - index);
        animate(offset);
        index = myIndex;
        showButton();
      }
    }
  }

  container.onmouseover = stop;
  container.onmouseout = play;

  play();
};