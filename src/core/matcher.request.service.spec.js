describe('Matcher.Request.Service', function() {
    var requestService, cryptoService;
    var sender = {
        publicKey: 'FJuErRxhV9JaFUwcYLabFK5ENvDRfyJbRz8FeVfYpBLn',
        privateKey: '9dXhQYWZ5468TRhksJqpGT6nUySENxXi9nsCZH9AefD1'
    };
    var asset = Currency.create({
        id: 'AaFXAN1WTM39XjECHW7DsVFixhq9yMGWHdM2ghr83Gmf',
        displayName: 'WBTC',
        precision: 8
    });
    var matcherKey = 'Ei5BT6ZvKmB5VQLSZGo8mNkSXsTwGG4zUWjN7yu7iZo5';

    // Initialization of the module before each test case
    beforeEach(module('waves.core.services'));

    // Injection of dependencies
    beforeEach(inject(function($injector) {
        requestService = $injector.get('matcherRequestService');
        cryptoService = $injector.get('cryptoService');

        // changing non-deterministic signatures with deterministic ones
        // to always have the same transaction signature
        spyOn(cryptoService, 'nonDeterministicSign').and.callFake(function (privateKeyBytes, signatureData) {
            return cryptoService.deterministicSign(privateKeyBytes, signatureData);
        });
    }));

    it('should successfully sign create order request', function () {
        var amount = Money.fromTokens(2, Currency.WAV);
        var price = Money.fromTokens(0.5, asset);
        var fee = Money.fromTokens(0.01, Currency.WAV);
        var order = {
            orderType: 'sell',
            price: price,
            amount: amount,
            time: 1489592282029,
            expiration: 1492184282029,
            fee: fee,
            matcherKey: matcherKey
        };

        var request = requestService.buildCreateOrderRequest(order, sender);

        expect(request.price).toEqual(5000000000000000);
        expect(request.amount).toEqual(200000000);
        expect(request.matcherFee).toEqual(1000000);
        expect(request.senderPublicKey).toEqual(sender.publicKey);
        expect(request.matcherPublicKey).toEqual(matcherKey);
        expect(request.signature)
            .toEqual('4bjt4voEV7h2iRULSBDUKtcyuNMfbG7QJKfNSbNnNkPaS8STChDatHxH4FF9cFBf6Hf1jn5C8vMuwrC167FS3jXp');
    });

    it('should successfully sign cancel order request', function () {
        var orderId = '8PwufMfkR4BMgzp8K7RMXMVDxbi5BTsacUtf4ADrdpsh';

        var request = requestService.buildCancelOrderRequest(orderId, sender);

        expect(request.orderId).toEqual(orderId);
        expect(request.sender).toEqual(sender.publicKey);
        expect(request.signature)
            .toEqual('3ZUHGpaw7Ahmx1GfmUd66tE7288wZJZHQ992ikiy3Q9auyPyW5ru8DdvUmMrS1TnYshvPGYzu3srGUnZfQjgGM9c');
    });

    it('should throw an error is orderId is not given', function () {
        expect(function () { requestService.buildCancelOrderRequest(undefined, sender); }).toThrowError(/orderId/);
    });

    it('should throw an error if sender is not given', function () {
        expect(function () { requestService.buildCancelOrderRequest('some order id'); }).toThrowError(/Sender/);
    });
});