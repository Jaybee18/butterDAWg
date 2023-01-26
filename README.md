# butterDAWg
FL Studio clone with Electron (WIP)
 
It is not a 100% clone:
there are some deviations from the original that I believe improve the UX

Basic audio functionality implemented

- [X] playback/sequencing of samples
- [ ] routing tracks to channels
- [ ] piano editor
- [X] audio graph editor
- [ ] usage of fileview for importing samples/plugins
- [X] POC custom plugins
- [X] basic application of custom plugins
- [ ] dynamic application of custom plugins

# Development
install all necessary node modules:
```
npm install
```

then run with
```
npm run start
```

# Build
not yet

# Version History

version 0.5.0 (current):
+ windowmanager massively improved
+ audio playback reworked (mor efficinci + better UX)
+ playlist view internally reworked (now a canvas instead of thousands of divs)
+ plugins can now be independently created with their own HTML/CSS/JS files and dynamically loaded in

![butterDAWg_v5 0](https://user-images.githubusercontent.com/64578396/211222614-d9ad333d-e9fa-46cb-b29c-fc76fba8ed66.png)


version 0.4.2:
+ Added Audio Graph bc idk
+ we now got windows in this bitch
+ custom plugins now possible
+ generalized internal codebase for easier integration and development

![butterDAWg_v4 2](https://user-images.githubusercontent.com/64578396/207967816-20bcf9ed-d39a-4359-a71a-7f9733af2c68.png)
 
 
version 0.4.1:
+ Tracks can be routed through channels
+ channels have volume indicators
+ track cursor will play from whereever it is positioned (given not placed in the middle of a sample)
+ POC for custom plugins implemented
 
 
version 0.4.0:
![grafik](https://user-images.githubusercontent.com/64578396/193315177-dd883db7-2012-4ae1-812d-96c06e7c5642.png)

 
version 0.3.2:
![grafik](https://user-images.githubusercontent.com/64578396/179958914-d864f78e-aea7-4405-9f14-c46003c45ade.png)


version 0.3.1:
![grafik](https://user-images.githubusercontent.com/64578396/179421263-a6d788f2-9b32-45d8-bf33-9c88090629fa.png)

 
version 0.3.0:
![grafik](https://user-images.githubusercontent.com/64578396/179368655-fbc7182f-d894-48b3-84ed-ef6f8d42b5ce.png)

 
version 0.2.0:
 ![image](https://user-images.githubusercontent.com/64578396/178554704-c7bd4468-8edc-4d52-bc17-284d148f41fb.png)

 
 
version 0.1.0:
![image](https://user-images.githubusercontent.com/64578396/178067986-6e06db41-a3b2-4854-9871-685442ee5db8.png)
