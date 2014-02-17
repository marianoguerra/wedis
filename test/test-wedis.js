/*global define, describe, it, expect*/
define(["jasmine", "src/wedis"], function (Jasmine, Wedis) {
    "use strict";

    describe("wedis", function () {

        function newClient() {
            var client = Wedis.createClient();
            client._clearDB("yes I really want it");

            return client;
        }

        it("should return a client", function () {
            var client = newClient();

            expect(client.dbname).toBe(0);
        });

        it("should set a key to a value", function () {
            var client = newClient();

            client.set("name", "bob");

            expect(client._db.name).toBe("bob");
        });

        it("should delete keys", function () {
            var client = newClient();

            client.set("name", "bob");
            client.set("name1", "patrick");
            client.set("name2", "bob");

            expect(client.del("name", "name1", "name3")).toBe(2);
            expect(client.get("name2")).toBe("bob");
            expect(client.get("name")).toBe(null);
        });

        it("should list keys", function () {
            var client = newClient(),
                keys;

            client.set("name", "bob");
            client.set("name1", "patrick");
            client.set("name2", "bob");

            keys = client.keys("*");
            expect(keys.length).toBe(3);
            expect(keys.indexOf("name")).not.toBe(-1);
            expect(keys.indexOf("name1")).not.toBe(-1);
            expect(keys.indexOf("name2")).not.toBe(-1);
        });

        it("should override a key when set two times", function () {
            var client = newClient();

            client.set("name", "bob");
            client.set("name", "alice");

            expect(client._db.name).toBe("alice");
        });

        it("should get a seted value", function () {
            var client = newClient();

            client.set("name", "bob");

            expect(client.get("name")).toBe("bob");
        });

        it("should return null if get to a key that doesn't exist", function () {
            var client = newClient();

            expect(client.get("name")).toBe(null);
        });

        it("should set a key in a hash if the hash doesn't exist", function () {
            var client = newClient();
            client.hset("bob", "color", "yellow");
            expect(client._db.bob.color).toBe("yellow");
        });

        it("should set a key in a hash if the hash exists", function () {
            var client = newClient();
            client.hset("bob", "color", "yellow");
            client.hset("bob", "location", "bikini bottom");
            expect(client._db.bob.color).toBe("yellow");
            expect(client._db.bob.location).toBe("bikini bottom");
        });

        it("should return 0 if the value is new in the hash", function () {
            var
                client = newClient(),
                result = client.hset("bob", "color", "yellow");

            expect(result).toBe(0);
        });

        it("should return 0 if the value is new in the hash", function () {
            var
                result,
                client = newClient();
                
            client.hset("bob", "color", "yellow");
            result = client.hset("bob", "color", "Yellow");

            expect(result).toBe(1);
        });

        it("should get a key in a hash", function () {
            var client = newClient();
            client.hset("bob", "color", "yellow");

            expect(client.hget("bob", "color")).toBe("yellow");
        });

        it("should return null if key doesn't exist", function () {
            var client = newClient();
            expect(client.hget("bob", "color")).toBe(null);
        });

        it("should return null if field doesn't exist", function () {
            var client = newClient();
            client.hset("bob", "name", "bob");
            expect(client.hget("bob", "color")).toBe(null);
        });

        // TODO: test that passing 0 fields fails
        it("should return 0 if deleting an unexistent hash", function () {
            var client = newClient();

            expect(client.hdel("bob", "name")).toBe(0);
        });

        it("should return the number of deleted values on hdel", function () {
            var client = newClient();
            client.hset("bob", "color", "yellow");
            client.hset("bob", "name", "bob");

            expect(client.hdel("bob", "name", "color")).toBe(2);
        });

        it("should return the number of deleted values even when nonexistent on hdel", function () {
            var client = newClient();
            client.hset("bob", "color", "yellow");
            client.hset("bob", "name", "bob");

            expect(client.hdel("bob", "name", "color", "weight", "address")).toBe(2);
        });

        it("should actually delete on hdel", function () {
            var client = newClient();
            client.hset("bob", "color", "yellow");
            client.hset("bob", "name", "bob");
            client.hset("bob", "friend", "patrick");

            client.hdel("bob", "name", "color");

            expect(client.hget("bob", "name")).toBe(null);
            expect(client.hget("bob", "color")).toBe(null);
            expect(client.hget("bob", "friend")).toBe("patrick");
        });

        it("should increment value", function () {
            var client = newClient();
            client.set("count", 5);
            client.incr("count");

            expect(client.get("count")).toBe(6);
        });

        it("should increment value even if it's not set", function () {
            var client = newClient();
            client.incr("count");

            expect(client.get("count")).toBe(1);
        });

        it("should increment by value", function () {
            var client = newClient();
            client.set("count", 5);
            client.incrby("count", 3);

            expect(client.get("count")).toBe(8);
        });

        it("should increment by value even if it's not set", function () {
            var client = newClient();
            client.incrby("count", 3);

            expect(client.get("count")).toBe(3);
        });

        it("should decrement value", function () {
            var client = newClient();
            client.set("count", 5);
            client.decr("count");

            expect(client.get("count")).toBe(4);
        });

        it("should decrement value even if it's not set", function () {
            var client = newClient();
            client.decr("count");

            expect(client.get("count")).toBe(-1);
        });

        it("should decrement by value", function () {
            var client = newClient();
            client.set("count", 5);
            client.decrby("count", 3);

            expect(client.get("count")).toBe(2);
        });

        it("should decrement by value even if it's not set", function () {
            var client = newClient();
            client.decrby("count", 3);

            expect(client.get("count")).toBe(-3);
        });

        it("should check if a key exists", function () {
            var client = newClient();

            client.set("name", "bob");

            expect(client.exists("name")).toBe(true);
            expect(client.exists("idontexist")).toBe(false);
        });

        it("should check if a key exists in a hash", function () {
            var client = newClient();

            client.hset("bob", "name", "bob");

            expect(client.hexists("bob", "name")).toBe(true);
            expect(client.hexists("bob", "idontexist")).toBe(false);
            expect(client.hexists("asdasda", "idontexist")).toBe(false);
        });

        it("should get the whole hash", function () {
            var client = newClient();
            client.hset("bob", "color", "yellow");
            client.hset("bob", "name", "bob");
            client.hset("bob", "age", 5);

            expect(client.hgetall("bob")).toEqual({
                "color": "yellow",
                "name": "bob",
                "age": 5
            });
        });

        it("should get hash keys", function () {
            var client = newClient();
            client.hset("bob", "color", "yellow");
            client.hset("bob", "name", "bob");
            client.hset("bob", "age", 5);

            expect(client.hkeys("bob").sort()).toEqual(["age", "color", "name"]);
        });

        it("should get hash values", function () {
            var client = newClient();
            client.hset("bob", "color", "yellow");
            client.hset("bob", "name", "bob");
            client.hset("bob", "age", 5);

            expect(client.hvals("bob").sort()).toEqual([5, "bob", "yellow"]);
        });

        it("should get hash field count", function () {
            var client = newClient();
            client.hset("bob", "color", "yellow");
            client.hset("bob", "name", "bob");
            client.hset("bob", "age", 5);

            expect(client.hlen("bob")).toEqual(3);
        });

        it("should append to an unexistent thing", function () {
            var client = newClient();
            client.append("thing", "hi");

            expect(client.get("thing")).toBe("hi");
        });

        it("should append to an existing thing", function () {
            var client = newClient();
            client.set("thing", "hi");
            client.append("thing", " there");

            expect(client.get("thing")).toBe("hi there");
        });

        it("should append as a string", function () {
            var client = newClient();
            client.append("thing", 4);
            expect(client.get("thing")).toBe("4");
            client.append("thing", 5);
            expect(client.get("thing")).toBe("45");
        });

        it("should get multiple keys", function () {
            var client = newClient();
            client.set("name", "bob");
            client.set("color", "yellow");

            expect(client.mget()).toEqual([]);
            expect(client.mget("name", "color")).toEqual(["bob", "yellow"]);
            expect(client.mget("name", "color", "foo")).toEqual(["bob", "yellow", null]);
        });

        it("should set multiple keys", function () {
            var client = newClient();
            client.mset("name", "bob", "color", "yellow");

            expect(client.mget("name", "color")).toEqual(["bob", "yellow"]);
        });

        it("should increment by value in a hash", function () {
            var client = newClient();
            client.hset("asd", "count", 5);
            client.hincrby("asd", "count", 3);

            expect(client.hget("asd", "count")).toBe(8);
        });

    });
});

