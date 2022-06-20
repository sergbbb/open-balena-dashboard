<template>
  <b-tabs content-class="mt-3">
    <b-tab title="Custom
          device support in OpenBalena" active>
      <div class="cooked">
        <h1>Custom device support in OpenBalena</h1>
        <p>So you’ve managed to build BalenaOS for your custom device and would like to connect this device to
          OpenBalena?
          Here’s how I managed to get this working:</p>
        <p>In order to use custom device types in OpenBalena we need to tell OpenBalena about these device types. For
          this
          to work, we need to provide two different types of information:</p>
        <ol>
          <li><a href="#device-type-contracts">Device type contracts</a></li>
          <li><a href="#device-type-information">Device type information</a></li>
        </ol>
        <h2>
          <a name="device-type-contracts-2" class="anchor" href="#device-type-contracts-2"></a>Device type contracts
        </h2>
        <p>For OpenBalena to even know about our custom device type, we need to provide a so-called contract for our
          device
          type. OpenBalena periodically downlods the contracts from one or two Github repositories. Once the contract
          has
          been downloaded, it is possible to create devices and fleets for this custom device type.</p>
        <p>Like I said, OpenBalena downloads the device contracts from one or two Github repositories. Out of the box
          OpenBalena downloads the device type contracts from the <code>contracts</code> folder in <a
            href="https://github.com/balena-io/contracts" class="inline-onebox" rel="noopener nofollow ugc">GitHub -
            balena-io/contracts: Balena.io Base Contracts <span class="badge badge-notification clicks"
                                                                title="1 click">1</span></a>.</p>
        <p>Additionally you can add a second Github repository. This can be done using the following optional ENV
          variables:</p>
        <div class="md-table">
          <table>
            <thead>
            <tr>
              <th>Variable</th>
              <th>Description</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>CONTRACTS_PRIVATE_REPO_OWNER</td>
              <td>Github organization</td>
            </tr>
            <tr>
              <td>CONTRACTS_PRIVATE_REPO_NAME</td>
              <td>Github repository</td>
            </tr>
            <tr>
              <td>CONTRACTS_PRIVATE_REPO_BRANCH</td>
              <td>Github branch</td>
            </tr>
            <tr>
              <td>CONTRACTS_PRIVATE_REPO_TOKEN</td>
              <td>Github access token</td>
            </tr>
            </tbody>
          </table>
        </div>
        <p>Both the public and private repository can be configured simultaniously. As you can see, the private repo can
          be
          configured with an access token and does not have to be publically accessible.</p>
        <p>In order to configure the ENV variables, we need to update the docker-compose file for the <code>api</code>
          service. This file can be found in <code>compose/services.yaml</code>.<br>
          Add the following lines underneath <code>services:</code>/<code>api:</code>/<code>environment:</code></p>
        <pre data-code-wrap="yaml"><code class="lang-nohighlight">CONTRACTS_PRIVATE_REPO_OWNER: ${OPENBALENA_CONTRACTS_PRIVATE_REPO_OWNER}
CONTRACTS_PRIVATE_REPO_NAME: ${OPENBALENA_CONTRACTS_PRIVATE_REPO_NAME}
CONTRACTS_PRIVATE_REPO_BRANCH: ${OPENBALENA_CONTRACTS_PRIVATE_REPO_BRANCH}
CONTRACTS_PRIVATE_REPO_TOKEN: ${OPENBALENA_CONTRACTS_PRIVATE_REPO_TOKEN}
</code></pre>
        <p>and configure the actual values by adding to <code>config/activate</code>:</p>
        <pre><code class="lang-bash">export OPENBALENA_CONTRACTS_PRIVATE_REPO_OWNER=...
export OPENBALENA_CONTRACTS_PRIVATE_REPO_NAME=...
export OPENBALENA_CONTRACTS_PRIVATE_REPO_BRANCH=...
export OPENBALENA_CONTRACTS_PRIVATE_REPO_TOKEN=...
</code></pre>
        <p>The added Github repository should at least contain the folder <code>contracts/hw.device-type</code>. For
          every
          device there should be a folder with the device type slug as name containing at least a
          <code>contract.json</code>
          and a logo svg file. Use an existing device type contract as reference.<br>
          More information about adding hardware contracts can be found here: <a
            href="https://github.com/balena-os/meta-balena/blob/master/contributing-device-support.md#step-3-hardware-contract"
            class="inline-onebox" rel="noopener nofollow ugc">meta-balena/contributing-device-support.md at master ·
            balena-os/meta-balena · GitHub <span class="badge badge-notification clicks" title="1 click">1</span></a>
        </p>
        <p>After configuring the public and/or private repos, restart OpenBalena using:</p>
        <pre><code class="lang-bash">./scripts/compose down
./scripts/compose up -d
</code></pre>
        <p>and check the logs for the <code>api</code> service using:</p>
        <pre data-code-wrap="shell"><code class="lang-nohighlight">./scripts/compose exec api journalctl -fn100
</code></pre>
        <p>Contracts are refreshed every 5 minutes, so after a while you should see something like this:</p>
        <pre data-code-wrap="any"><code class="lang-nohighlight">Jun 10 14:25:00 5d0a0b8810a2 api[1456]: [Scheduler] Running job: contractSync
</code></pre>
        <p>Now all new devices in your contracts repo are available to OpenBalena. You can now create a fleet for your
          custom device type:</p>
        <pre data-code-wrap="shell"><code class="lang-nohighlight">balena fleet create MyCustomDeviceFleet --type my-custom-device-type
</code></pre>
        <p>However, when you want to create a device configuration or configure a device image by running:</p>
        <pre data-code-wrap="shell"><code class="lang-nohighlight">balena config generate --fleet MyCustomDeviceFleet --version 2.12.7
</code></pre>
        <p>this fails with the following error:</p>
        <pre data-code-wrap="any"><code class="lang-nohighlight">Device type slug not recognized. Perhaps misspelled?
Check available device types with "balena devices supported"
</code></pre>
        <p>This is not due to <code>Device type slug not recognized</code> like the error says, but because we do not
          have
          the device type information yet. We’ll configure this next.</p>
        <h2>
          <a name="device-type-information-3" class="anchor" href="#device-type-information-3"></a>Device type
          information
        </h2>
        <p>Besides the contracts, a lot of commands in OpenBalena require yet another json file for custom devices to
          work.
          This information is loaded from an AWS S3 bucket which also contains the BalenaOS images for all devices.</p>
        <p>Out of the box, OpenBalena downloads the device <code>device-type.json</code> file from <a
          href="https://s3.console.aws.amazon.com/s3/buckets/resin-production-img-cloudformation"
          rel="noopener nofollow ugc">https://s3.console.aws.amazon.com/s3/buckets/resin-production-img-cloudformation
          <span
            class="badge badge-notification clicks" title="1 click">1</span></a>. Obviously our custom image information
          is
          not present there, so just like the Contracts, we need to reconfigure this.</p>
        <p>In order to configure the S3 bucket where device images are stored, we need to change a couple of ENV
          variables
          again:</p>
        <div class="md-table">
          <table>
            <thead>
            <tr>
              <th>Variable</th>
              <th>Description</th>
            </tr>
            </thead>
            <tbody>
            <tr>
              <td>IMAGE_STORAGE_ENDPOINT</td>
              <td>S3 server endpoint, defaults to <code>s3.amazonaws.com</code>
              </td>
            </tr>
            <tr>
              <td>IMAGE_STORAGE_BUCKET</td>
              <td>S3 bucket name, defaults to <code>resin-production-img-cloudformation</code>
              </td>
            </tr>
            <tr>
              <td>IMAGE_STORAGE_PREFIX</td>
              <td>Folder inside the bucket, defaults to <code>images</code>
              </td>
            </tr>
            <tr>
              <td>IMAGE_STORAGE_ACCESS_KEY</td>
              <td>S3 Access key, default empty</td>
            </tr>
            <tr>
              <td>IMAGE_STORAGE_SECRET_KEY</td>
              <td>S3 Secret key, default empty</td>
            </tr>
            <tr>
              <td>IMAGE_STORAGE_FORCE_PATH_STYLE</td>
              <td>Setting whether to force path style URLs for S3 objects</td>
            </tr>
            </tbody>
          </table>
        </div>
        <p>For this setting there is no way to configure a secondary bucket, so the only approach is to overwrite the
          entire
          setting. Now we could set up our own AWS S3 bucket, clone the <code>resin-production-img-cloudformation</code>
          bucket (6.5 TB total, <code>images</code> folder is 3.8 TB) and add our own custom device, but I chose a
          different
          approach.</p>
        <p>At the moment it’s not possible to download device images using the <code>balena os download</code> command,
          so
          we don’t need the actual image files. Just the <code>device-type.json</code> files are enough. Let’s create a
          local S3 bucket with just the <code>device-type.json</code> files for devices we might use and add our custom
          devices to that. OpenBalena already runs a S3 service to store the docker images, so we can use that and
          create a
          new bucket there.</p>
        <p>In order to do this, and also set-up an easy way to copy device-type files from the <code>resin-production-img-cloudformation</code>
          bucket to our own, we’ll need to add some variables to the <code>compose/services.yaml</code>.</p>
        <p>Under <code>services:</code>/<code>api:</code>/<code>environment:</code> replace</p>
        <pre data-code-wrap="yaml"><code class="lang-nohighlight">IMAGE_STORAGE_BUCKET: resin-production-img-cloudformation
IMAGE_STORAGE_PREFIX: images
IMAGE_STORAGE_ENDPOINT: s3.amazonaws.com
</code></pre>
        <p>with</p>
        <pre data-code-wrap="yaml"><code class="lang-nohighlight">IMAGE_STORAGE_BUCKET: ${OPENBALENA_IMAGES_S3_BUCKET}
IMAGE_STORAGE_PREFIX: images
IMAGE_STORAGE_ENDPOINT: s3.${OPENBALENA_HOST_NAME}
IMAGE_STORAGE_FORCE_PATH_STYLE: true
IMAGE_STORAGE_ACCESS_KEY: ${OPENBALENA_S3_ACCESS_KEY}
IMAGE_STORAGE_SECRET_KEY: ${OPENBALENA_S3_SECRET_KEY}
</code></pre>
        <p>Next, we’ll edit <code>config/activate</code> and change:</p>
        <pre><code class="lang-bash">export OPENBALENA_S3_BUCKETS="registry-data"
</code></pre>
        <p>to</p>
        <pre><code class="lang-bash">export OPENBALENA_S3_BUCKETS="registry-data;images-data"
export OPENBALENA_IMAGES_S3_BUCKET=images-data
</code></pre>
        <p>and restart OpenBalena with:</p>
        <pre><code class="lang-bash">./scripts/compose down
./scripts/compose up -d
</code></pre>
        <h3>
          <a name="optional-sync-device-type-information-4" class="anchor"
             href="#optional-sync-device-type-information-4"></a>Optional: sync device-type information</h3>
        <p>If you want to use OpenBalena not only with your own custom device, but also use supported BalenaOS devices,
          we
          can synchronize the device-type json files from the <code>resin-production-img-cloudformation</code> bucket to
          our
          own.</p>
        <p>For this you’ll need to have an AWS (free) account and create an AWS Access key and Secret key using: <a
          href="https://docs.aws.amazon.com/general/latest/gr/aws-sec-cred-types.html#access-keys-and-secret-access-keys"
          class="inline-onebox" rel="noopener nofollow ugc">Understanding and getting your AWS credentials - AWS General
          Reference</a></p>
        <p>Edit <code>compose/services.yaml</code> and under
          <code>services:</code>/<code>s3:</code>/<code>environment:</code> add:</p>
        <pre data-code-wrap="yaml"><code class="lang-nohighlight">MC_HOST_s3: https://${OPENBALENA_AWS_ACCESS_KEY}:${OPENBALENA_AWS_SECRET_KEY}@s3.amazonaws.com
</code></pre>
        <p>and add the following to <code>config/activate</code> (fill your keys):</p>
        <pre><code class="lang-bash">export OPENBALENA_AWS_ACCESS_KEY=...
export OPENBALENA_AWS_SECRET_KEY=...
</code></pre>
        <p>Restart OpenBalena with:</p>
        <pre><code class="lang-bash">./scripts/compose down
./scripts/compose up -d
</code></pre>
        <p>and run the following commands to syncronize for example <code>raspberrypi4-64</code> device image version
          <code>2.98.33</code>
          from <code>resin-production-img-cloudformation</code> to your own bucket:</p>
        <pre data-code-wrap="shell"><code class="lang-nohighlight">./scripts/compose exec s3 mc cp -r s3/resin-production-img-cloudformation/images/raspberrypi4-64/2.98.33/device-type.json localhost/images-data/images/raspberrypi4-64/2.98.33
</code></pre>
        <h3>
          <a name="add-your-custom-device-to-the-images-bucket-5" class="anchor"
             href="#add-your-custom-device-to-the-images-bucket-5"></a>Add your custom device to the images bucket</h3>
        <p>To add your custom device to the images bucket you’ll need to add a file called <code>device-type.json</code>
          to
          the folder <code>images/[my-custom-device-slug]/[my-custom-device-balenaos-version]</code>. We can do this
          using
          the <code>mc</code> command we’ve used above:</p>
        <pre data-code-wrap="shell"><code class="lang-nohighlight">cat my-custom-device-type.json | ./scripts/compose exec -T s3 mc pipe localhost/images-data/images/my-custom-device-type/my-custom-device-version/device-type.json
</code></pre>
        <p>The <code>my-custom-device-type.json</code> file is generated when building the BalenaOS image. It’s called
          the
          same as the <code>.coffee</code> file you used and located in the same folder.</p>
        <p>Now the command that failed above:</p>
        <pre><code class="lang-bash">balena config generate --fleet MyCustomDeviceFleet --version 2.12.7
</code></pre>
        <p>should generate a valid device configuration.</p>
        <h2>
          <a name="wrapping-up-6" class="anchor" href="#wrapping-up-6"></a>Wrapping up</h2>
        <p>So, in summary, to add your custom device to OpenBalena you’ll need to:</p>
        <ul>
          <li>Configure OpenBalena to download Hardware contracts from a Github repository where you’ve added the
            contract
            json file for your device
          </li>
          <li>Configure OpenBalena to download device type information from an S3 bucket where you’ve added the
            device-type
            json file for your device
          </li>
        </ul>
      </div>
    </b-tab>
    <b-tab title="Host OS upgrade">
      <div class="cooked">
        <p>We are working to make host OS upgrades easier on openBalena. <strong>Meanwhile,</strong> the following example shows how to upgrade the host OS and the supervisor by running some commands on the host OS itself.</p>
        <p>For example, assuming a Raspberry Pi 3 running balenaOS version v2.26.0 that should be upgraded to version v2.29.0, the first command to run (on a host OS shell) is:</p>
        <ul>
          <li><code>hostapp-update -r -i resin/resinos:2.31.0_rev1-raspberrypi3 </code></li>
        </ul>
        <p>The names of host OS images (such as “resin/resinos:2.31.0_rev1-raspberrypi3”) can be found on the Docker Hub: <a href="https://hub.docker.com/r/resin/resinos/tags">https://hub.docker.com/r/resin/resinos/tags <span class="badge badge-notification clicks" title="42 clicks">42</span></a><br>
          Please select the highest available image “revision”, e.g. ‘rev3’ in preference to ‘rev2’ or ‘rev1’.</p>
        <p>Then the balena supervisor needs to be updated as well. For example, the command to update the supervisor to version v9.9.0 (to be executed on a host OS shell) is:</p>
        <ul>
          <li><code>update-resin-supervisor -t v9.9.0</code></li>
        </ul>
        <p>Although the balena supervisor can be updated independently of balenaOS, we test selected versions of the supervisor with balenaOS releases, so it’s a good idea to use those supervisor versions. Search the <a href="https://github.com/balena-os/meta-balena/blob/master/CHANGELOG.md">meta-balena ChangeLog <span class="badge badge-notification clicks" title="34 clicks">34</span></a> for “supervisor” to find out the supervisor version that goes together with a balenaOS version.</p>
        <p><strong>WARNING: for anyone reading this post, these instructions only apply to <a href="https://www.balena.io/open/">openBalena <span class="badge badge-notification clicks" title="8 clicks">8</span></a>. If using <a href="https://www.balena.io/cloud/">balenaCloud <span class="badge badge-notification clicks" title="3 clicks">3</span></a>, or if you are unsure, please <a href="https://www.balena.io/docs/reference/OS/updates/self-service/">upgrade the host OS through the web dashboard <span class="badge badge-notification clicks" title="5 clicks">5</span></a>.</strong></p></div>
    </b-tab>
    <b-tab title="Amazon for registry storage">
      <p>
        in config/active:
      </p>

      <ul>
        <li><code>export OPENBALENA_S3_ACCESS_KEY=aws_access_key</code></li>
        <li><code>export OPENBALENA_S3_BUCKETS=my_s3_bucket_name</code></li>
        <li><code>export OPENBALENA_S3_ENDPOINT=https://s3.us-west-1.amazonaws.com</code></li>
        <li><code>export OPENBALENA_S3_REGION=us-west-2</code></li>
        <li><code>export OPENBALENA_S3_SECRET_KEY=aws_secret_key</code></li>
      </ul>

      <code>./scripts/quickstart -c -U my-user-email -P my-password -d my-domain</code>
      <br/><code>./scripts/compose up -d</code>

    </b-tab>
  </b-tabs>

</template>

<script>
export default {
  name: "index"
}
</script>

<style scoped>

</style>
