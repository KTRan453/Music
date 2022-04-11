/*Các bước làm
1.render > ok
2.Scroll top > ok
3.Play/pause/seek:html cung cấp cho các pthuc dành cho play/pause,...
4.CD rotate
5.Next/prev(lùi)
6.Random
7.Next/Repeat when ended
8.Active
9.Scroll active song into view
10.Play song when click
*/
//Khi currentIndex thay đổi thì defineProperties() thay đổi -> currentSong thay đổi theo -> rồi ms ts các bước tiếp theo của ctrinh 
//currentIndex sẽ thay đổi khi bấm next,Đc xử lí tại hàm nextSong()
//currentSong nhận vào 1 obj trong songs,có name,singer,img,path
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY='F8_PLAYER'
const cd=$('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')  //thẻ chèn nhạc
const playBtn=$('.btn-toggle-play')
const player=$('.player')
const progress =$('#progress')
const nextBtn=$('.btn-next')
const prevBtn=$('.btn-prev')
const randomBtn=$('.btn-random')
const repeatBtn=$('.btn-repeat')
const playlist=$('.playlist')
const app={
    currentIndex:0,  //để lấy ptu đầu tiên của mảng,Vs {this}.currentIndex sẽ lấy dc toàn bộ tt song và lưu vào currentSong
    isPlaying:false, //các kiểu boolean này tương tự như for trong input vs checkbox.Để bắt tương tác giữa 2 bên
    isRandom:false,  //nút random có sáng hay ko
    isRepeat:false,
    config:JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},  //chưa lưu gì sẽ lấy cái obj(logical) || config dc lấy từ localSt
    songs:[
        {
            name:'Bad Rabbit',
            singer:'Ed Sheeran',
            path:'./asset/music/BadHabit.mp3',
            img:'./asset/img/iBadHabit.jpg'
        },
        {
            name:'Hiên Nhà',
            singer:'Trang Hàn',
            path:'./asset/music/HienNha.mp3',
            img:'./asset/img/hiennha.jpg'
        },
        {
            name:'Leave The Door Open',
            singer:'Bruno Mars',
            path:'./asset/music/LeaveTheDoorOpen.mp3',
            img:'./asset/img/Leave.jpg'
        },
        {
            name:'Love you Baby',
            singer:'Frank Sinatra ',
            path:'./asset/music/LoveYouBaby.mp3',
            img:'./asset/img/Love.jpg'
        },
        {
            name:'To the Moon',
            singer:'Hooligan',
            path:'./asset/music/TotheMoon.mp3',
            img:'./asset/img/Moon.jpg'
        },
        {
            name:'What are words',
            singer:'Chris Medina ',
            path:'./asset/music/Whatarewords.mp3',
            img:'./asset/img/words.jpg'
        }
    ],
    setConfig:function(key,value){
        this.config[key] = value; //như biến data nhưng lưu ở dạng obj||config này là {key:vlaue} riêng của VALUE trong localSt
                                  //key là biến tham số đại diện cho Key của Obj,v nên ko cần ['key']
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config))
    },
    render:function(){//Hàm render return ra 6L thì trong div cả 6L đều có <div class="song ${index === this.currentIndex ? 'active' : ''}">  
                      //Vì vậy thằng nào thỏa vs dk if(với toán tử 3 ngôi) thì sẽ nhận dc "active" ||currentIndex tăng khi nextSong
                      //Mỗi song dc nhận "active"(css màu đỏ b) khi có Index == currentIndex
                      const htmls=this.songs.map((song,index) =>{//Dk if-Nếu index của arr trùng vs currentIndex(bài đang phát) thì dc thêm "active"
                                                                 //index này mặc định của arr songs
        return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">  
            <div class="thumb" style="background-image: url('${song.img}')">
            </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
            </div>
        `
        })
        //console.log(htmls)
        playlist.innerHTML=htmls.join('')
    },
    defineProperties:function(){ //app.currentSong bên console để get ra
        //Thêm mới thuộc tính currentSong vào đối tượng app
        Object.defineProperty(this,'currentSong',{  //this=app && currentSong là tt nhận vào giá trị dc get,là thông tin song đầu tiên
            get:function(){  //có thể set và get
                return this.songs[this.currentIndex] //currentSong đc nhận vào bài hát đầu tiên từ currentIndex.Rồi đc đẩy vào audio
            }
        })
    },
    handleEvents:function(){  //các hàm sự kiện con sếp lộn xộn vẫn dc,vì chỉ chạy khi có sự kiện chuột,sự kiện,...
        const _this=this //app (this cung nên chú ý scope)
        const cdWidth=cd.offsetWidth  //width ban đầu hình cái đĩa nhạc = 200
        //Xử lí cd quay và dừng
        const cdThumbAnimate = cdThumb.animate([   //hàm animate tùy chỉnh 1 hành động
            {
                transform:'rotate(360deg)'
            }
        ],
            {
                duration:10000, //10s
                interations:Infinity  //quay vô hạn
            }
        )
        cdThumbAnimate.pause()  //đặt mặc định pause
        
        document.onscroll=function(){
            //scrollY/scrollTop vị trí tọa độ hiện tại của thanh cuộn nằm dọc của phần tử được chọn.Đỉnh= 0 -> Đáy
            const scrollTop=window.scrollY || document.documentElement.scrollTop //trục tọa độ.Tùy trình duyệt nên truthly 2c
            //console.log(window.scrollY) //tọa độ trục Y
            const newCdWidth = cdWidth - scrollTop  //width mới của cd:scrollTop tăng bn thì cdWidth giảm bao nấy
            //console.log(newCdWidth) //=> kéo hêt sẽ ra số âm,width ko set âm dc vì vậy ko ẩn dc hết cd.Cần set như bên dưới
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0 //cd sẽ thu lại  || giá trị 0 là cho cdWidth = 0 luôn
            cd.style.opacity=newCdWidth/cdWidth//newCdWidth set lun nhỏ hơn số ban đầu->new càng nhỏ lại opacity càng nhỏ hơn.Maxopacity=1
        }

        //Xử lí khi click play
        playBtn.onclick=function(){ //trong onclick ko dùng this dc,bởi vì nó đang nằm trong pthuc con nữa.this sẽ trỏ tới playBtn
            if(_this.isPlaying){ //Vs đk boolean thì trong if luôn là true.Mặc định isPlaying=false ->true
                audio.pause() //Hàm dừng lại ||Khi mà pause or play xong thì xuống ngay event bên dưới
            }
            else{           
                audio.play() //Hàm phát âm thanh/video
            }
            
        }
        //Khi song dc play
        audio.onplay=function(){ //Sự kiện phát xảy ra khi âm thanh / video đã được bắt đầu hoặc không còn tạm dừng
            _this.isPlaying= true;
            player.classList.add('playing')
            cdThumbAnimate.play()
        }
          //Khi song bị pause
        audio.onpause=function(){  //Khi mà pause rồi thì event này làm việc -> isPlaying=false
            _this.isPlaying= false;
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        //Khi tiến độ bài hát thay đổi thanh tua cung thay đổi tương ứng
        audio.ontimeupdate=function(){ //thời gian nhạc hiện tại đang phát dc bao nhiêu|| sự kiện lấy dc thời lượng phat hiện tại của song
           // console.log(audio.currentTime/audio.duration*100)  //duration:tổng thời lượng bài hát
           if(audio.duration){
                const progressPercent=Math.floor(audio.currentTime / audio.duration * 100)// tính xem Song phát dc bn % rồi gán vô
                progress.value=progressPercent //thanh tua chạy ngay tại đây,khi đc gán giá trị sau mỗi lần updatetime
           }
        }

        //Xử lí khi tua bài hát(khi tua thì làm sao cho audio tua theo)-input type="range" có value tăng,thanh input tự chạy
        progress.oninput=function(e){ //event khi có sự thay đổi diễn ra trên thanh tua
            const seekTime=audio.duration / 100 * e.target.value //e.target.value:lấy ra value(default%) của progress
            audio.currentTime=seekTime //Tgian hiện tại của audio bằng tgian thanh tua || currentTime là property mà DOM cung cấp
        }

        //1.5(random) - Xử lí Sự kiện click cho nút Next song
        nextBtn.onclick=function(){
            if(_this.isRandom){
                _this.playRandomSong()
            }
            else{
                _this.nextSong() //Khi nextSong thì thuộc tính currentIndex thay đổi->tđ currentIndex của render->render()
            }
            audio.play()
            _this.render() //phần render này(code if in render) ch0 active css vào list Song,Sẽ render lại ds(cập nhật song dc css đỏ)
            _this.scrollToActiveSong()
        }
   
        //Sự kiện click cho nút Prev song
        prevBtn.onclick=function(){
            if(_this.isRandom){  //nút random đang sáng
                _this.playRandomSong()
            }
            else{ 
                _this.prevSong() //Thông tin,audio nhạc sẽ dc thay đổi và audio.play() để phát
            }
            audio.play()
            _this.render()  //Vs cách khác có thể remove hoặc add thay cho render
            _this.scrollToActiveSong()

        }

        //1.Xử lí cho nút random(sáng màu) bật/tắt random (css) || Khi đang sáng thì mới playsong ramdom dc(hàm nextSong)
        randomBtn.onclick=function(e){ //vs click đầu default isRandom là false dc chuyển thành true.Lần click t2 sẽ chuyển thành false
            _this.isRandom = !_this.isRandom // khi click L1 gán lại bằng true,click L2 lại đc đổi thành false
                                             //Đặt isRandom=false <=> randomBtn chưa active(chưa sáng)
            _this.setConfig('isRandom',_this.isRandom)                                
            randomBtn.classList.toggle('active',_this.isRandom)  //toggle: có class thì xóa,ko thì thêm                                                      
         
        }

        //Xử lí khi bấm vào nút lặp lại bài hát(kết vs event onended)
        repeatBtn.onclick=function(){
            _this.isRepeat = !_this.isRepeat // khi click L1 gán lại bằng true,click L2 lại đc đổi thành false
            _this.setConfig('isRepeat',_this.isRepeat)                                
            repeatBtn.classList.toggle('active',_this.isRepeat)//Chưa có class="active",nên toggle đóng vai trò thêm "active" 
                                                               //kết hợp thêm dk nữa là isRepeat=true
        }

        //Xử lí khi end bài,tự chuyển,repeat
        audio.onended=function(){ //sao hàm này hiểu dc nút repeat đang sáng,Vs if luôn true
            if(_this.isRepeat){//thấy sáng là hiểu đang muốn lặp lại.Chứ các is... trong bài này ko có ý nghĩa hay tác động gì khác
                audio.play()
            }
            else{
                nextBtn.click()  //click() :auto bấm click nút next.ko cần tự bấm 
            }
        }

        //Lắng nghe hành vi khi click vào playlist(song bất kì để play)
        playlist.onclick=function (e){
            const songNode = e.target.closest('.song:not(.active)')  //closest target nào trùng với ('tt') thì sẽ trả ra
            //const e.target.closest('.option')
            if(songNode || e.target.closest('.option')){//closet() trả về nó or cha nó,ko có thì trả về null
                //xử lí khi click vào song
                if(songNode){
                    _this.currentIndex = Number(songNode.dataset.index) //lấy ra thuộc tính data-index của dtg mà ta click
                    //console.log(e.target.get.getAttribute('data-index')) 
                    _this.loadCurrentSong()
                    _this.render()  //
                    audio.play()
                }
                if(e.target.closest('.option')){
                    //
                }
            }   
        }

    },

    scrollToActiveSong:function(){
        setTimeout(() => {
            $('.song.active').scrollIntoView({//bài hát có active sẽ dc kéo đến 
                behavior:'smooth', //hành vi kéo:mềm mại
                block:'center' //
            })   
        },300)
    },

    //
    loadConfig:function(){  //Khi load lại web vẫn lưu các hiển thị như ban đầu
        this.isRandom= this.config.isRandom
        this.isRepeat= this.config.isRepeat
        //Object.assign(this,this.config) //như này sẽ ko an toàn về sau

    },


    //audio đc gán cho bài hát đầu tiên(tên,ảnh,và file nhạc)||Hàm load đưa ảnh,info ra View
    loadCurrentSong:function(){    
        heading.textContent = this.currentSong.name  //this.currentSong <=> this.songs[this.currentIndex]
        cdThumb.style.backgroundImage=`url('${this.currentSong.img}')`
        audio.src=this.currentSong.path
    },

    //Xử lí khi đã bấm vào next song
    nextSong:function(){
        this.currentIndex++ // lúc này ở thuộc tính currentSong cung thay đổi theo this.songs[this.currentIndex] <=> songs[index++]
        if(this.currentIndex >= this.songs.length){ //vượt quá số lượng bài hát thì quay về bài đầu tiên
            this.currentIndex = 0
        }
        this.loadCurrentSong()//Khi hàm loadCS() chạy,Hàm chứa currentSong dc gọi(currentIndex đã dc cập nhật) -> currentSong có gtri ms
    },
    prevSong:function(){
        this.currentIndex--   //bài hát hiện tại--
        if(this.currentIndex < 0){ //vượt quá số lượng bài hát thì quay về bài đầu tiên
            this.currentIndex = this.songs.length - 1//nếu index hiện tại ngược về quá 0(bài đầu tiên) thì = bài hát cuối(tổng bài-1)
        }
        this.loadCurrentSong()
    },

    //2.Random ngẫu nhiên bài hát:Xử lí random ra index ngẫu nhiên,ko dc trùng vs index hiện tại
    playRandomSong:function(){  
        let newIndex;
        do{ //dùng do{} lặp ít nhất 1 lần
            newIndex = Math.floor(Math.random() * this.songs.length) //math.floor() làm tròn dưới 1 số thập phân-Math.random trả ra 0->1
        }while(newIndex === this.currentIndex) //dk lặp nếu đúng thì quay lại lặp,sai dk thì dừng(Nếu newIndex = 0 thì pải dc lặp lại)
        this.currentIndex = newIndex   //currentIndex hiện tại ngay lập tức sẽ đổi thành Index mới
        this.loadCurrentSong()
    },

    start:function(){ // hàm trong obj trỏ tới chính obj này thì dùng thís || dồn hết hàm vào start thì làm 1 lần rất tiện
        //Gán cấu hình từ config vào ứng dụng
        this.loadConfig() //Hàm đọc localStorage,lấy is... từ config rồi lưu vào biến gốc -> load lại vẫn lưu thay đổi index như cũ
        
        //Đ/n các thuộc tính cho object
        this.defineProperties() //Hàm này phải dc chạy đầu để cập nhật biến

        //Hàm gắn các sự kiện vào DOM,các event tương tác vs DOM nên ko phải load lại hàm này
        this.handleEvents() //Hàm này chứa các event DOM,khi run hàm này có chức năng gắn các hàm xử lí(onclick=function()) vào sự kiên
                            //Khi sự kiện xảy ra,các hàm dc gắn này sẽ chạy(chạy khi xảy ra sự kiện,ko cần call vs cách đ/n event như này)
                            //và  ko chạy lại handleEvent()
        //Tải,thay đổi thông tin bài hát (đầu tiên) vào UI khi ứng dụng chạy
        this.loadCurrentSong()
        


        this.render()
    
        //Hiển thị trạng thái ban đầu của Btn repeat và random
        randomBtn.classList.toggle('active',this.isRandom)                                                   
        repeatBtn.classList.toggle('active',this.isRepeat)
    }
            
}
app.start()