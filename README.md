# OpenBalena Dashboard

This is UI for OpenBalena project: https://www.balena.io/open/

#### OpenBalena supported devices: Raspberry Pi family, the Intel NUC, the NVIDIA Jetson TX2, and the balenaFin

## Install OpenBalena + OpenBalena Dashboard

#### Create subdomains openbalena.mydomain.com, *.openbalena.mydomain.com and configure on server IP

**1. Install and run OpenBalena using this manual:** https://www.balena.io/open/docs/getting-started/.
Set Docker CE to restart automatically and edit config/docker-compose.yml, add:
```
services:
  api:
    restart: always
  cert-provider:
    restart: always
  db:
    restart: always
  haproxy:
    restart: always
  redis:
    restart: always
  registry:
    restart: always
  s3:
    restart: always
  vpn:
    restart: always
```
**2. Clone the project to the ~/balena-dashboard** directory

**3. Copy ~/open-balena/config/certs/root/ca.crt to ~/balena-dashboard/api/ca.crt**

**4. Run /bin/bash ssh_gen.sh to generate SSH keys to connect to boxes**

!! To access boxes via SSH, you need to add a public SSH key to the project immediately after creating the project. So that all newly created boxes have this key in their config !!


## Run application

1. Copy .env.example to .env and chane config vars

2. Run with Docker Compose. For DEV: docker-compose up -d. For PROD: docker-compose -f docker-compose.yml -f docker-compose.production.yml up --build -d 


## Deploy app code with balena-cli (FROM https://www.balena.io/open/docs/getting-started/#Install-the-balena-CLI-on-the-local-machine)

1. Install Docker, and balena-cli on the local machine : https://github.com/balena-io/balena-cli/releases
2. Install self-signed certificates on the local machine : https://www.balena.io/open/docs/getting-started/#Install-self-signed-certificates-on-the-local-machine
3. Add config file for balena-cli:

        balenaUrl: "openbalena.mydomain.com"
        
    The CLI configuration file can be found at:
    
    On Linux or macOS: ~/.balenarc.yml
    
    On Windows: %UserProfile%\_balenarc.yml
4. Wrapping up the CLI installation, set an environment variable that points to the root certificate copied previously on the local machine. This step is to ensure the CLI can securely interact with the openBalena server.

        bash	export NODE_EXTRA_CA_CERTS='/path/to/ca.crt'
        Windows cmd.exe	set NODE_EXTRA_CA_CERTS=C:\path\to\ca.crt
        Windows PowerShell	$Env:NODE_EXTRA_CA_CERTS="C:\path\to\ca.crt"

5. `balena login` (with credentials)
6. `balena deploy APPNAME --logs --source SOURCE_CODE_LOCATION --emulated --build`


## Amazon for registry storage
in config/active:

```
export OPENBALENA_S3_ACCESS_KEY=aws_access_key
export OPENBALENA_S3_BUCKETS=my_s3_bucket_name
export OPENBALENA_S3_ENDPOINT=https://s3.us-west-1.amazonaws.com
export OPENBALENA_S3_REGION=us-west-2
export OPENBALENA_S3_SECRET_KEY=aws_secret_key
```


## SSH access to boxes

#### You can access boxes only from OpenBalena HOST server

### Way 1

        balena tunnel {uuid} -p 22222:22222
        ssh root@localhost -p 22222

you need to specify a private key for root@localhost !!!
by default, the private key is located here: api/devices (the result of running /bin/bash ssh_gen.sh)

### Way 2
This is just a quick guide on gaining SSH access to a host device with your openBalena setup. I can confirm that this works with both development and production balenaOS images, but for production images you must make sure that your SSH key is included in the config.json of the device’ boot partition. More information on that can be found here 17.

You are going to need a system tool called proxytunnel to do this, and I have only tested this on an Ubuntu system personally. I am assured that the process will work on macOS too, but how you get proxytunnel installed is outside the scope of this post.

```
$ sudo apt install proxytunnel
$ proxytunnel -V
proxytunnel 1.9.0 (rev 242) Copyright 2001-2008 Proxytunnel Project
Then you should use the balena CLI tool to create an API key for your account:

$ balena api-key generate proxytunnel


Registered api key 'proxytunnel':

sbdfvjhsbvvbliBLJHblJHBlJHBljhBY

This key will not be shown again, so please save it now.
This key will be required, so make a note of it. Now it’s time to configure SSH to use proxytunnel to connect to the balena VPN tunnelling service on your openBalena instance:

$ nano ~/.ssh/config

Host *.balena
  ProxyCommand proxytunnel -p vpn.<your openBalena domain>:3128 -d %h:22222 -F ~/.ssh/balena-ssh
  IdentityFile ~/balena-dashboard/api/devices
  ServerAliveInterval 30
  
Substitute the domain as appropriate. Now create the permissions file:
$ nano ~/.ssh/balena-ssh

proxy_user=root
proxy_passwd=sbdfvjhsbvvbliBLJHblJHBlJHBljhBY

Make sure the permissions on this file are acceptable:
$ chmod 600 ~/.ssh/balena-ssh

You are ready to go, to connect you will need the full UUID of the device, and you should use it like so:

$ ssh root@<full UUID>.balena
This will ask you to confirm the host identification and then drop you into a root prompt. If you’re on a production image, then the SSH keys on your machine will be used to identify you, so they must be setup on the device first, otherwise you will see a rejection due to not having a valid key.
```

## Change logo on running devices

mount -ro remount,rw /
rm /resin-boot/splash/resin-logo.png
rm /mnt/boot/splash/resin-logo.png
wget -q http://slink.net.ua/resin-logo.png -O /resin-boot/splash/resin-logo.png
wget -q http://slink.net.ua/resin-logo.png -O /mnt/boot/splash/resin-logo.png

vi /mnt/boot/system-connections/resin-wifi
[connection]
interface-name=wlan0
id=resin-wifi
type=wifi


https://www.balena.io/docs/learn/more/masterclasses/host-os-masterclass/#13-advanced-dbus-examples


## Manually create a new server certificat with following steps.

Renamed the following old files in the config/certs/vpn folder.
issued/vpn.balena.iet.mw.tu-dresden.crt
private/vpn.balena.iet.mw.tu-dresden.key
reqs/vpn.balena.iet.mw.tu-dresden.req
index.txt
Download easy-rsa to a temporary folder and extract it with following command:
curl -sL https://github.com/OpenVPN/easy-rsa/releases/download/v3.0.5/EasyRSA-nix-3.0.5.tgz | tar xz --strip-components=1

Recreate the servcer certificat with key with this command:
./easyrsa/easyrsa --pki-dir="./vpn" --days=730 build-server-full "vpn.<server-domain>" nopass

Convert with this command the cert- and the key-file to an base64 string and replace the values of the keys OPENBALENA_VPN_SERVER_CRT and OPENBALENA_VPN_SERVER_KEY.
echo "$(cat ./vpn/issued/vpn.<server-domain>.crt)" | base64 --wrap=0 2>/dev/null
echo "$(cat ./vpn/private/vpn.<server-domain>.key)" | base64 --wrap=0 2>/dev/null
Recreate the VPN Container.
./scripts/compose up -d --force-recreate --no-deps

This steps worked for me and the client connect after a short time and marked as online in the device list.


## Problem hdmi not work on last OS

To fix: 
RESIN_HOST_CONFIG_hdmi_ignore_edid=0xa5000080


Can be:
framebuffer_width=1920
framebuffer_height=1080
hdmi_drive=2

## Add this to allow hdmi hotplug
hdmi_force_hotplug=1


## Local mode
`balena env add BALENA_SUPERVISOR_LOCAL_MODE 1 --device <device-uuid>`


Then in my application source directory I ran:
`balena push 1.2.3.4`
where 1.2.3.4 was the IP of my device.
