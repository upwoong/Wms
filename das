<html>
    <body>
        

<!--테일윈드 불러오기-->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.16/tailwind.min.css">
<!--폰트어썸 불러오기-->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta2/css/all.min.css">
<link rel="stylesheet" href="css/smartmirrormanage.css">
<div class="all-box p-16">
  <div class="all-element-box bg-white">

    <!--section-1 시작-->
    <!--1__스마트 미러-->
    <div class="section section-1 flex justify-center">
      <div>
        <div class="flex">
          <div class="font-32 c-545454 font-bold mr-1">
            <span>스마트 미러</span>
          </div>
          <div class="font-14 c-949494 font-bold flex items-center">
            <span class="mt-4">미리보기</span>
          </div>
        </div>
        <div class="h-1 w-56 bg-1F94F1 flex justify-center">
        </div>
      </div>
    </div>
    <!--section-1 끝-->

    <!--section-2 시작-->
    <div class="flex">
      <!--영상시작-->
      <div class="flex-1">
        <!--셀렉트-->
        <div class="flex items-center mt-5">
          <div class="bg-69B1EB text-white text-base font-bold whitespace-nowrap px-2 py-1 w-36">Video ConTents</div>
          <div class="selection-box selection-box-1 w-full pl-1">
            <form method="post">
            <select name="name" class="h-7 w-full text-gray-400 border-1-8D8D8D" onchange="chagevidoeSelect()">
              <option selected hidden>{{selectsmartmirror}}</option>
              {{#each combovideo}}
                  <option name='adw' value="{{this}}">{{this}}</option>
                  {{/each}}
          </select>
          </div>
          <input class="file-up-btn border-r" type="submit" value="확인" name="submit" onclick='this.form.action ="/smartmirrormanage"' />
        </div>
      </form>

        <div class="video-back-bg border-radius-5 mt-5">
          <div style="height: 85px;"></div>
          <!--비디오-->
          <div class="flex items-center justify-center">
            <div>
              <video class="min-w-full m-h-280" src="/smartmirror/video/{{num}}" autoplay controls loop muted></video>
            </div>
          </div>
          <!--텍스트-->
          <div class="flex justify-center items-center h-28 font-14 c-949494 font-bold">
            <span>
              {{num}}
            </span>
          </div>
        </div>
      </div>
      <!--영상 끝-->

      <div style="width: 5%;"></div>

      <!--이미지 시작-->
      <div class="flex-1">
        <!--셀렉트-->
        <div class="flex items-center mt-5">
          <div class="bg-69B1EB text-white text-base font-bold whitespace-nowrap px-2 py-1 w-36">Image ConTents</div>
          <div class="selection-box w-full selection-box-2 pl-1">
            <form method="post">
            <select name="selectimage" class="text-gray-400 h-7 w-full border-1-8D8D8D">
              <option selected hidden>{{selectimage}}</option>
              {{#each combovideo}}
                  <option name='adw' value="{{this}}">{{this}}</option>
                  {{/each}}
          </select>
          </div>

          </label>
          <input class="file-up-btn border-r" type="submit" value="확인" name="submit" onclick='this.form.action ="/smartmirrormanage"' />
        </div>
        <!--이미지-->
        <div class="img-back-bg border-radius-5 mt-5">
          <div class="flex justify-center">
            <div class="poster-img mt-1">
              <img src="/smartmirror/image/{{imgfile}}" alt="">
            </div>
          </div>
          <!--텍스트-->
          <div class="hei-90 flex justify-center items-center font-14 c-949494 font-bold">
            <span>
              {{imgfile}}
            </span>
          </div>
        </div>
      </div>
    </form>
      <!--이미지 끝-->
    </div>
    <!--section-2 끝-->

    <!--최상단 공통 조상-->
  </div>
</div>

</body>
</html>