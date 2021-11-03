<!--테일윈드 불러오기-->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.16/tailwind.min.css">
<!--폰트어썸 불러오기-->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta2/css/all.min.css">
<link rel="stylesheet" href="css/media.css">
<div class="all-box p-12">
  <div class="all-element-box bg-white">

    <!--section-1-->
    <div class="section section-1 flex items-center mb-1">
      <div>
        <div class="title-deck"></div>
      </div>
      <div class="title-text text-3xl font-bold">
        <span>ConTents</span>
      </div>
      <div class="body-text text-sm font-bold" style="margin-top: 8px;">
        <span>Detail Setting.</span>
      </div>
      <!--section-1 공통 부모-->
    </div>

    <!--section-2 시작-->
    <div class="flex">
      <div class="flex-1">
        <!--영상 시작-->
        <div class="w-full">
          <video class="border-radius-5 w-full min-height-387" src="test.mp4" controls muted autoplay id="showvideo"></video>
        </div>
        <!--영상 끝-->
        <!--버튼 시작-->
        <div class="flex items-center mt-1">
          <div class="video-title-text text-base font-bold text-white p-3 mr-1">
            <span>
              Video ConTents
            </span>
          </div>
          <!--셀렉트-->
          <form method="post">
          <div class="flex-1 selection-box selection-box-1 h-full">
            <select class="selection selection-1 text-gray-400 border-8D text-8D" name="name" id="videofilelist" onchange="chagevidoeSelect()">
              <option value="" selected disabled>=== 동영상 url 선택 ===</option>
              {{#each videofile}}
              <option name="videofile" value="{{this.name}}">{{this.name}}
              </option>
              {{/each}}
            </select>
          </div>
        </div>
        <!--버튼 시작-->
          <!--삭제-->
          <div class="flex items-center">
            <div class="Del-btn flex items-center w-full">
              <div class="flex-1 flex items-center">
                <div class="Vi-Icon img-box flex justify-center flex-1">
                  <img src="https://cdn.jsdelivr.net/gh/kimhyeji324/ICT_Resource@master/docs/Vi__Url-Pl-icon.png" alt="">
                </div>
                <div class="Vi-Pl-text flex justify-center flex-1">
                  <span>
                    URL 삭제
                  </span>
                </div>
                <div class="flex-1"></div>
              </div>
            </div>
            <div>
              <input class="flie-del-btn" type="submit" value="확인" onclick='this.form.action= "/deletevideo"'>
            </div>
          </form>
            <!--버튼 끝-->
          </div>
          <!--추가-->
          <form method="post" enctype="multipart/form-data" action="/process/video">
          <div class="filebox flex items-center">
            <div class="Del-btn flex items-center w-full">
              <div class="flex-1 flex items-center">
                <div class="Vi-Icon img-box flex justify-center flex-1">
                  <img src="https://cdn.jsdelivr.net/gh/kimhyeji324/ICT_Resource@master/docs/Vi__Url-Pl-icon.png" alt="">
                </div>
                <div class="Vi-Pl-text flex justify-center flex-1">
                  <span>
                    URL 추가
                  </span>
                </div>
                <div class="flex-1"></div>
              </div>
            </div>
            <input class="file-up-btn" type="submit" value="확인" name="submit" />
          </div>
          <!--업로드-->
          <div class="flex items-center">
            <div class="Del-btn flex items-center w-full">
              <div class="flex-1 flex items-center">
                <div class="Vi-Icon img-box flex justify-center flex-1">
                  <img src="https://cdn.jsdelivr.net/gh/kimhyeji324/ICT_Resource@master/docs/Vi__Url-Pl-icon.png" alt="">
                </div>
                <div class="Vi-Pl-text flex justify-center flex-1">
                  <span>
                    URL 업로드
                  </span>
                </div>
                <div class="flex-1"></div>
              </div>
            </div>
            <div>
              <label class="h-full border-o" for="file">확인</label>
              <input type="file" id="file" name="photo">
            </div>
          </div>
          
        </form>
        <!--버튼 끝-->
        <!--비디오 레이아웃 공통 부모-->
      </div>
      <!--영상 끝-->

      <div style="width: 10%;"></div>

      <!--이미지 시작-->
      <div class="flex-1">
        <div class="flex justify-center items-center">
        <div class="preview-img max-height-387 max-width-273">
          <img class="border-radius-5 min-height-387 w-full object-cover" src="https://i.postimg.cc/J4RrxMQL/Kakao-Talk-20211015-115032591.jpg" alt="" style="border-radius: 5px;" id="showimage">
        </div>
        </div>
        <!--버튼 시작-->
        <div class="flex items-center mt-1">
          <div class="img-title-text text-base font-bold text-white p-3 mr-1">
            <span>
              Image ConTents
            </span>
          </div>
          <!--셀렉트-->
          <form method="post">
          <div class="flex-1 selection-box selection-box-1 h-full">
            <select class="selection selection-1 text-gray-400 border-8D text-8D" name="name" id="imgfilelist" onchange="chageimageSelect()">
              <option value="" selected disabled>=== 이미지 url 선택 ===</option>
              {{#each imgfile}}
              <option name="videofile" value="{{this.name}}">{{this.name}}
              </option>
              {{/each}}
            </select>
          </div>
        </div>
        <!--버튼 시작-->
        <form method="post" enctype="multipart/form-data" action="/process/image">
          <!--삭제-->
          <div class="flex items-center">
            <div class="Del-btn flex items-center w-full">
              <div class="flex-1 flex items-center">
                <div class="Vi-Icon img-box flex justify-center flex-1">
                  <img src="https://cdn.jsdelivr.net/gh/kimhyeji324/ICT_Resource@master/docs/Vi__Url-Pl-icon.png" alt="">
                </div>
                <div class="Vi-Pl-text flex justify-center flex-1">
                  <span>
                    URL 삭제
                  </span>
                </div>
                <div class="flex-1"></div>
              </div>
            </div>
            <div>
              <input class="flie-del-btn" type="submit" value="확인" onclick='this.form.action= "/deleteimage"'>
            </div>
          </div>
        </form>
          <!--추가-->
          <div class="filebox flex items-center">
            <div class="Del-btn flex items-center w-full">
              <div class="flex-1 flex items-center">
                <div class="Vi-Icon img-box flex justify-center flex-1">
                  <img src="https://cdn.jsdelivr.net/gh/kimhyeji324/ICT_Resource@master/docs/Vi__Url-Pl-icon.png" alt="">
                </div>
                <div class="Vi-Pl-text flex justify-center flex-1">
                  <span>
                    URL 추가
                  </span>
                </div>
                <div class="flex-1"></div>
              </div>
            </div>
            <input class="file-up-btn border-r" type="submit" value="확인" name="submit" />
          </div>
          <!--업로드-->
          <div class="flex items-center">
            <div class="Del-btn flex items-center w-full">
              <div class="flex-1 flex items-center">
                <div class="Vi-Icon img-box flex justify-center flex-1">
                  <img src="https://cdn.jsdelivr.net/gh/kimhyeji324/ICT_Resource@master/docs/Vi__Url-Pl-icon.png" alt="">
                </div>
                <div class="Vi-Pl-text flex justify-center flex-1">
                  <span>
                    URL 업로드
                  </span>
                </div>
                <div class="flex-1"></div>
              </div>
            </div>
            <div>
              <label class="file-up-btn border-r" for="selectimage">확인</label>
              <input type="file" id="selectimage" name="photo" value="확인">
            </div>
          </div>
        </form>
        <!--section-2 공통 부모-->
      </div>
      <!--최상단 공통 조상-->
    </div>
  </div>

    <script>

      function chagevidoeSelect() {
    let selectedvideo = document.getElementById("videofilelist");
    let showvideo = document.getElementById("showvideo");
    let selectvideotext = selectedvideo.options[selectedvideo.selectedIndex].text;
    showvideo.src = "../smartmirror/video/" + selectvideotext
  }

      function chageimageSelect() {
    let selectedimage = document.getElementById("imgfilelist");
    let showimage = document.getElementById("showimage");
    let selectimage = selectedimage.options[selectedimage.selectedIndex].text;
    showimage.src = "../smartmirror/image/" + selectimage;
  }
</script>