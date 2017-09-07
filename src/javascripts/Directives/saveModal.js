ngapp.controller('saveModalController', function($scope, $timeout, errorService) {
    // initialize scope variables
    $scope.saving = false;
    $scope.message = 'Closing';
    $scope.pluginsToProcess = xelib.GetElements().filter(function(handle) {
        return xelib.GetIsModified(handle);
    }).map(function(handle) {
        return {
            handle: handle,
            filename: xelib.Name(handle),
            active: true
        }
    });

    // helper functions
    let setMessage = function(message, detailedMessage = '') {
        $scope.$applyAsync(() => {
            $scope.message = message;
            $scope.detailedMessage = detailedMessage;
        });
    };

    let savePlugins = function() {
        setMessage('Saving plugins');
        $scope.pluginsToSave.forEach(function(plugin, index) {
            $scope.detailedMessage = `${plugin.filename} (${index}/${$scope.total})`;
            errorService.try(() => xelib.SaveFile(plugin.handle));
        });
    };

    let finalize = function() {
        setMessage('Finalizing xEditLib');
        xelib.Finalize();
        $scope.$emit('terminate');
    };

    let saveData = function() {
        if ($scope.pluginsToSave.length > 0) savePlugins();
        $scope.modalOptions.shouldFinalize ? finalize() : $scope.$emit('closeModal');
    };

    // scope functions
    $scope.save = function() {
        $scope.saving = true;
        $scope.pluginsToSave = $scope.pluginsToProcess.filter(function(plugin) {
            return plugin.active;
        });
        $scope.total = $scope.pluginsToSave.length;
        $timeout(saveData, 50);
    };

    // skip user interaction if there are no plugins to save
    if ($scope.pluginsToProcess.length === 0) $scope.save();
});