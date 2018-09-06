SOURCES := $(wildcard src/*.js) $(wildcard src/Mail/*.js)
RESOURCES := appinfo.json $(wildcard resources/images/*)
TARGET := pebblegmail.pbw
PEBBLEDEV := ../pebble-dev

$(TARGET): $(SOURCES) $(RESOURCES)
	nodejs -c $(SOURCES)
	[ -f oauth2_id ] && patch -p1 < oauth2_id
	cd $(PEBBLEDEV); . ./set-path; cd pebblejs; pebble build
	[ -f oauth2_id ] && patch -p1 -R < oauth2_id
	@cp $(PEBBLEDEV)/pebblejs/build/pebblejs.pbw $(TARGET)

test-basalt: $(TARGET)
	cd $(PEBBLEDEV); . ./set-path; cd pebblejs; \
		pebble kill; pebble wipe; pebble install --logs --emulator basalt

test-chalk: $(TARGET)
	cd $(PEBBLEDEV); . ./set-path; cd pebblejs; \
		pebble kill; pebble wipe; pebble install --logs --emulator chalk

.PHONY: test-basalt test-chalk
