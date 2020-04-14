![version](https://img.shields.io/badge/version-0.1-blue)
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

# Workday Lovelace card for Home Assistant

<br>

korean workday 커스텀 바이너리 센서를 위한 홈어시스턴트 lovelace 카드입니다.\
휴일 정보를 손쉽게 관리하고 센서에 실시간으로 반영하기 위해 만들었습니다.\
[Korean Workday Senser 설치하기](https://github.com/GrecHouse/korean_workday)

<br>

## Screenshot

![screenshot_workday_card](https://user-images.githubusercontent.com/49514473/79179537-cff36e80-7e42-11ea-8214-f42edbbc5703.png)

<br>

## Version history
| Version | Date        |               |
| :-----: | :---------: | ------------- |
| v0.1    | 2020.04.14  | 최초 배포 |

<br>

## Installation

### HACS로 설치
- HACS > SETTINGS 메뉴 선택
- ADD CUSTOM REPOSITORY에 `https://github.com/GrecHouse/korean-workday-card` 입력, \
  Category에 `Plugin` 선택 후 저장
- HACS > PLUGINS 메뉴에서 `[KR] Korean Workday Sensor Card` 검색하여 설치

### 직접 설치
- HA 설치 경로 아래 www 폴더에 파일을 넣어줍니다.\
`<config directory>/www/korean-workday-card.js`

<br>

## Usage

### input_text 추가

(필수) 카드 내용을 저장할 input_text 엔티티를 하나 HA에 추가해야 합니다.\
configuration.yaml 에 아래와 같이 추가합니다.

```yaml
input_text:
  holiday:
    name: Holiday
    max: 255
```

###  HA에 리소스 추가
(직접 설치시) HA 설정 > Lovelace 대시보드 > 리소스를 추가합니다.
- `/local/korean-workday-card.js?v=0.1`
- 리소스 유형은 `자바스크립트 모듈` 입니다.

### 카드 설정
lovelace 카드 설정은 아래와 같이 합니다.
```yaml
type: 'custom:korean-workday-card'
title: Holiday
entity: input_text.holiday
max_length: 255
autosave: false
```

### 설정값

|옵션|값|
|--|--|
|type| (필수) custom:korean-workday-card |
|entity| (필수) 휴일 목록을 저장할 input_text 엔티티 |
|title| (옵션) 카드 상단에 표시되는 카드명칭<br>설정하지 않을 경우 기본값은 Holiday |
|max_length| (옵션) 최대 입력 가능한 글자수<br>input_text의 최대길이인 255로 지정 |
|autosave| (옵션) 자동저장여부<br>false로 사용하는게 좋습니다.|


### 내용 입력

- 한 줄에 휴일 하나씩만 입력하세요.
- `yyyymmdd#휴일명` 또는 `mmdd#휴일명` 형식으로 입력합니다.
- `mmdd` 형식은 매년 반복되는 휴일인 경우에 사용하면 됩니다.
- `#휴일명`은 생략 가능합니다. 휴일명은 workday 센서에 속성값으로 보여집니다.
- 물음표 아이콘을 눌러 사용방법을 확인할 수 있습니다.
- 저장 아이콘을 입력하면 korean_workday 센서에 즉각적으로 반영됩니다.

<br>

### 이 카드는 [lovelace-multiline-text-input-card](https://github.com/faeibson/lovelace-multiline-text-input-card) 를 커스터마이징했습니다.

<br>

## 버그 또는 문의사항
네이버 카페 [HomeAssistant](https://cafe.naver.com/koreassistant/) `그렉하우스` \
네이버 카페 [SmartThings&IoT Home](https://cafe.naver.com/stsmarthome/) `그레고리하우스`

