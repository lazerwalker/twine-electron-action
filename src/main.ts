import * as core from '@actions/core'
import {exec} from '@actions/exec'
import {mv} from '@actions/io'

async function run(): Promise<void> {
  try {
    // - name: Test for presence of Windows or macOS codesigning secrets
    //   id: vars
    //   shell: bash
    //   run: |
    //     unset HAS_APPLE_CREDS
    //     if [[ -n $CERTIFICATE_OSX_APPLICATION && -n $CERTIFICATE_PASSWORD ]]; then HAS_APPLE_CREDS='true' ; fi
    //     echo set-output name=HAS_APPLE_CREDS::${HAS_APPLE_CREDS}

    //     unset HAS_WINDOWS_CREDS
    //     if [[ -n $CERTIFICATE_WINDOWS_PFX ]]; then HAS_WINDOWS_CREDS='true' ; fi
    //     echo set-output name=HAS_WINDOWS_CREDS::${HAS_WINDOWS_CREDS}
    //   env:
    //     CERTIFICATE_OSX_APPLICATION: ${{ secrets.CERTIFICATE_OSX_APPLICATION }}
    //     CERTIFICATE_PASSWORD: ${{ secrets.CERTIFICATE_PASSWORD }}
    //     CERTIFICATE_WINDOWS_PFX: ${{ secrets.CERTIFICATE_WINDOWS_PFX }}

    // eslint-disable-next-line no-console
    console.log('Attemping to find npm path!')

    await exec('npm', ['install'], {cwd: 'electron-wrapper'})

    if (process.env.GITHUB_WORKSPACE) {
      await mv(`${process.env.GITHUB_WORKSPACE}/src`, 'electron-wrapper/src/')
      await mv(`${process.env.GITHUB_WORKSPACE}/icon.png`, 'electron-wrapper')
      await exec('npm', ['run', 'build-icons'], {cwd: 'electron-wrapper'})
    }
    // - name: Add MacOS certs
    //   if: matrix.os == 'macos-latest' && steps.vars.outputs.HAS_APPLE_CREDS
    //   run: |
    //     KEY_CHAIN=build.keychain
    //     CERTIFICATE_P12=certificate.p12
    //     echo $CERTIFICATE_OSX_APPLICATION | base64 --decode > $CERTIFICATE_P12
    //     security create-keychain -p actions $KEY_CHAIN
    //     security default-keychain -s $KEY_CHAIN
    //     security unlock-keychain -p actions $KEY_CHAIN
    //     security import $CERTIFICATE_P12 -k $KEY_CHAIN -P $CERTIFICATE_PASSWORD -T /usr/bin/codesign;
    //     security set-key-partition-list -S apple-tool:,apple: -s -k actions $KEY_CHAIN
    //     rm -fr *.p12chmod +x add-osx-cert.sh && ./add-osx-cert.sh
    //   env:
    //     CERTIFICATE_OSX_APPLICATION: ${{ secrets.CERTIFICATE_OSX_APPLICATION }}
    //     CERTIFICATE_PASSWORD: ${{ secrets.CERTIFICATE_PASSWORD }}

    // - name: Add Windows certificate
    //   if: matrix.os == 'windows-latest' && steps.vars.outputs.HAS_WINDOWS_CREDS
    //   id: write_file
    //   uses: timheuer/base64-to-file@v1
    //   with:
    //     fileName: 'win-certificate.pfx'
    //     encodedString: ${{ secrets.CERTIFICATE_WINDOWS_PFX }}

    await exec('npm', ['run', 'make'], {cwd: './electron-wrapper'})
    // TODO: make sure the right stuff is in ENV
    // 1. How to thread through APP_NAME
    // 2. Deal with codesigning stuff later

    //   env:
    //     APP_NAME: My Twine game
    //     APPLE_ID: ${{ secrets.APPLE_ID }}
    //     APPLE_ID_PASSWORD: ${{ secrets.APPLE_ID_PASSWORD }}
    //     WINDOWS_PFX_FILE: ${{ steps.write_file.outputs.filePath }}
    //     WINDOWS_PFX_PASSWORD: ${{ secrets.WINDOWS_PFX_PASSWORD }}

    // Replace this with artifacts for now
    // - name: Release on GitHub
    //   uses: softprops/action-gh-release@v1
    //   env:
    //     GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    //   with:
    //     files: |
    //       app/out/**/*.deb
    //       app/out/**/*.dmg
    //       app/out/**/*Setup.exe
    //       app/out/**/*.rpm
    //       app/out/**/*.zip
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
