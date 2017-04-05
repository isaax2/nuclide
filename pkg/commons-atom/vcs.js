'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DIFF_EDITOR_MARKER_CLASS = exports.RevertibleStatusCodes = exports.FileChangeStatusToTextColor = exports.FileChangeStatusToIcon = exports.FileChangeStatusToPrefix = exports.HgStatusToFileChangeStatus = exports.FileChangeStatus = exports.findVcs = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let findVcsHelper = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (dir) {
    const options = { cwd: dir };
    const hgResult = yield (0, (_process || _load_process()).asyncExecute)('hg', ['root'], options);
    if (hgResult.exitCode === 0) {
      return {
        vcs: 'hg',
        root: hgResult.stdout.trim()
      };
    }

    const gitResult = yield (0, (_process || _load_process()).asyncExecute)('git', ['rev-parse', '--show-toplevel'], options);
    if (gitResult.exitCode === 0) {
      return {
        vcs: 'git',
        root: gitResult.stdout.trim()
      };
    }

    throw new Error('Could not find VCS for: ' + dir);
  });

  return function findVcsHelper(_x) {
    return _ref.apply(this, arguments);
  };
})();

/**
 * For the given source file, find the type of vcs that is managing it as well
 * as the root directory for the VCS.
 */


let findVcs = exports.findVcs = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (dir) {
    let vcsInfo = vcsInfoCache[dir];
    if (vcsInfo) {
      return vcsInfo;
    }

    vcsInfo = yield findVcsHelper(dir);
    vcsInfoCache[dir] = vcsInfo;
    return vcsInfo;
  });

  return function findVcs(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

let hgActionToPath = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (nodePath, actionName, actionDoneMessage, action) {
    if (nodePath == null || nodePath.length === 0) {
      atom.notifications.addError(`Cannot ${actionName} an empty path!`);
      return;
    }
    const repository = repositoryForPath(nodePath);
    if (repository == null || repository.getType() !== 'hg') {
      atom.notifications.addError(`Cannot ${actionName} a non-mercurial repository path`);
      return;
    }
    const hgRepository = repository;
    try {
      yield action(hgRepository);
      atom.notifications.addSuccess(`${actionDoneMessage} \`${repository.relativize(nodePath)}\` successfully.`);
    } catch (error) {
      atom.notifications.addError(`Failed to ${actionName} \`${repository.relativize(nodePath)}\``, { detail: error.message });
    }
  });

  return function hgActionToPath(_x5, _x6, _x7, _x8) {
    return _ref5.apply(this, arguments);
  };
})();

let deleteFile = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (nuclideFilePath) {
    const filePath = (_nuclideUri || _load_nuclideUri()).default.getPath(nuclideFilePath);
    const fsService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(nuclideFilePath);
    try {
      yield fsService.unlink(filePath);
      const repository = repositoryForPath(nuclideFilePath);
      if (repository == null || repository.getType() !== 'hg') {
        return;
      }
      yield repository.remove([filePath], true);
    } catch (error) {
      atom.notifications.addError('Failed to delete file', {
        detail: error
      });
    }
  });

  return function deleteFile(_x9) {
    return _ref6.apply(this, arguments);
  };
})();

exports.getDirtyFileChanges = getDirtyFileChanges;
exports.observeStatusChanges = observeStatusChanges;
exports.addPath = addPath;
exports.revertPath = revertPath;
exports.confirmAndRevertPath = confirmAndRevertPath;
exports.getHgRepositories = getHgRepositories;
exports.getHgRepositoryStream = getHgRepositoryStream;
exports.repositoryForPath = repositoryForPath;
exports.repositoryContainsPath = repositoryContainsPath;
exports.filterMultiRootFileChanges = filterMultiRootFileChanges;
exports.getMultiRootFileChanges = getMultiRootFileChanges;
exports.confirmAndDeletePath = confirmAndDeletePath;

var _collection;

function _load_collection() {
  return _collection = require('../commons-node/collection');
}

var _process;

function _load_process() {
  return _process = require('../commons-node/process');
}

var _observable;

function _load_observable() {
  return _observable = require('../commons-node/observable');
}

var _atom = require('atom');

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../nuclide-remote-connection');
}

var _nuclideHgRpc;

function _load_nuclideHgRpc() {
  return _nuclideHgRpc = require('../nuclide-hg-rpc');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../commons-node/nuclideUri'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _event;

function _load_event() {
  return _event = require('../commons-node/event');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const { StatusCodeNumber: HgStatusCodeNumber } = (_nuclideHgRpc || _load_nuclideHgRpc()).hgConstants;
const vcsInfoCache = {};

const FileChangeStatus = exports.FileChangeStatus = Object.freeze({
  ADDED: 1,
  MODIFIED: 2,
  MISSING: 3,
  REMOVED: 4,
  UNTRACKED: 5
});

FileChangeStatus;

const HgStatusToFileChangeStatus = exports.HgStatusToFileChangeStatus = Object.freeze({
  [HgStatusCodeNumber.ADDED]: FileChangeStatus.ADDED,
  [HgStatusCodeNumber.MODIFIED]: FileChangeStatus.MODIFIED,
  [HgStatusCodeNumber.MISSING]: FileChangeStatus.MISSING,
  [HgStatusCodeNumber.REMOVED]: FileChangeStatus.REMOVED,
  [HgStatusCodeNumber.UNTRACKED]: FileChangeStatus.UNTRACKED
});

const FileChangeStatusToPrefix = exports.FileChangeStatusToPrefix = Object.freeze({
  [FileChangeStatus.ADDED]: '[A] ',
  [FileChangeStatus.MODIFIED]: '[M] ',
  [FileChangeStatus.MISSING]: '[!] ',
  [FileChangeStatus.REMOVED]: '[D] ',
  [FileChangeStatus.UNTRACKED]: '[?] '
});

const FileChangeStatusToIcon = exports.FileChangeStatusToIcon = Object.freeze({
  [FileChangeStatus.ADDED]: 'diff-added',
  [FileChangeStatus.MODIFIED]: 'diff-modified',
  [FileChangeStatus.MISSING]: 'stop',
  [FileChangeStatus.REMOVED]: 'diff-removed',
  [FileChangeStatus.UNTRACKED]: 'question'
});

const FileChangeStatusToTextColor = exports.FileChangeStatusToTextColor = Object.freeze({
  [FileChangeStatus.ADDED]: 'text-success',
  [FileChangeStatus.MODIFIED]: 'text-warning',
  [FileChangeStatus.MISSING]: 'text-error',
  [FileChangeStatus.REMOVED]: 'text-error',
  [FileChangeStatus.UNTRACKED]: 'text-error'
});

const RevertibleStatusCodes = exports.RevertibleStatusCodes = [FileChangeStatus.ADDED, FileChangeStatus.MODIFIED, FileChangeStatus.REMOVED];

const DIFF_EDITOR_MARKER_CLASS = exports.DIFF_EDITOR_MARKER_CLASS = 'nuclide-diff-editor-marker';

function getDirtyFileChanges(repository) {
  const dirtyFileChanges = new Map();
  const statuses = repository.getAllPathStatuses();
  for (const filePath in statuses) {
    const changeStatus = HgStatusToFileChangeStatus[statuses[filePath]];
    if (changeStatus != null) {
      dirtyFileChanges.set(filePath, changeStatus);
    }
  }
  return dirtyFileChanges;
}

const UPDATE_STATUS_DEBOUNCE_MS = 50;
function observeStatusChanges(repository) {
  return (0, (_event || _load_event()).observableFromSubscribeFunction)(repository.onDidChangeStatuses.bind(repository)).debounceTime(UPDATE_STATUS_DEBOUNCE_MS).startWith(null).map(() => getDirtyFileChanges(repository));
}

function addPath(nodePath) {
  return hgActionToPath(nodePath, 'add', 'Added', (() => {
    var _ref3 = (0, _asyncToGenerator.default)(function* (hgRepository) {
      if (!nodePath) {
        throw new Error('Invariant violation: "nodePath"');
      }

      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('hg-repository-add', { nodePath });
      yield hgRepository.addAll([nodePath]);
    });

    return function (_x3) {
      return _ref3.apply(this, arguments);
    };
  })());
}

function revertPath(nodePath, toRevision) {
  return hgActionToPath(nodePath, 'revert', 'Reverted', (() => {
    var _ref4 = (0, _asyncToGenerator.default)(function* (hgRepository) {
      if (!nodePath) {
        throw new Error('Invariant violation: "nodePath"');
      }

      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('hg-repository-revert', { nodePath });
      yield hgRepository.revert([nodePath], toRevision);
    });

    return function (_x4) {
      return _ref4.apply(this, arguments);
    };
  })());
}

function confirmAndRevertPath(path, toRevision) {
  const result = atom.confirm({
    message: 'Are you sure you want to revert?',
    buttons: ['Revert', 'Cancel']
  });

  if (!(result === 0 || result === 1)) {
    throw new Error('Invariant violation: "result === 0 || result === 1"');
  }

  if (result === 0) {
    revertPath(path, toRevision);
  }
}

function getHgRepositories() {
  return new Set((0, (_collection || _load_collection()).arrayCompact)(atom.project.getRepositories())
  // Flow doesn't understand that this filters to hg repositories only, so cast through `any`
  .filter(repository => repository.getType() === 'hg'));
}

function getHgRepositoryStream() {
  const currentRepositories = (0, (_event || _load_event()).observableFromSubscribeFunction)(atom.project.onDidChangePaths.bind(atom.project)).startWith(null).map(() => getHgRepositories());

  return (0, (_observable || _load_observable()).diffSets)(currentRepositories).flatMap(repoDiff => _rxjsBundlesRxMinJs.Observable.from(repoDiff.added));
}

/**
 * @param aPath The NuclideUri of a file or directory for which you want to find
 *   a Repository it belongs to.
 * @return A Git or Hg repository the path belongs to, if any.
 */
function repositoryForPath(aPath) {
  // Calling atom.project.repositoryForDirectory gets the real path of the directory,
  // which requires a round-trip to the server for remote paths.
  // Instead, this function keeps filtering local.
  const repositories = (0, (_collection || _load_collection()).arrayCompact)(atom.project.getRepositories());
  return repositories.find(repo => {
    try {
      return repositoryContainsPath(repo, aPath);
    } catch (e) {
      // The repo type is not supported.
      return false;
    }
  });
}

/**
 * @param repository Either a GitRepository or HgRepositoryClient.
 * @param filePath The absolute file path of interest.
 * @return boolean Whether the file path exists within the working directory
 *   (aka root directory) of the repository, or is the working directory.
 */
function repositoryContainsPath(repository, filePath) {
  const workingDirectoryPath = repository.getWorkingDirectory();
  if (pathsAreEqual(workingDirectoryPath, filePath)) {
    return true;
  }

  if (repository.getType() === 'git') {
    const rootGitProjectDirectory = new _atom.Directory(workingDirectoryPath);
    return rootGitProjectDirectory.contains(filePath);
  } else if (repository.getType() === 'hg') {
    const hgRepository = repository;
    return hgRepository._workingDirectory.contains(filePath);
  }
  throw new Error('repositoryContainsPath: Received an unrecognized repository type. Expected git or hg.');
}

/**
 * @param filePath1 An abolute file path.
 * @param filePath2 An absolute file path.
 * @return Whether the file paths are equal, accounting for trailing slashes.
 */
function pathsAreEqual(filePath1, filePath2) {
  const realPath1 = (_nuclideUri || _load_nuclideUri()).default.resolve(filePath1);
  const realPath2 = (_nuclideUri || _load_nuclideUri()).default.resolve(filePath2);
  return realPath1 === realPath2;
}

function filterMultiRootFileChanges(unfilteredFileChanges) {
  const filteredFileChanges = new Map();
  // Filtering the changes to make sure they only show up under the directory the
  // file exists under.
  for (const [root, fileChanges] of unfilteredFileChanges) {
    const filteredFiles = (0, (_collection || _load_collection()).mapFilter)(fileChanges, filePath => filePath.startsWith(root));
    filteredFileChanges.set(root, filteredFiles);
  }

  return filteredFileChanges;
}

function getMultiRootFileChanges(fileChanges, rootPaths) {
  let roots;
  if (rootPaths == null) {
    roots = (0, (_collection || _load_collection()).arrayCompact)(atom.project.getDirectories().map(directory => {
      const rootPath = directory.getPath();
      const repository = repositoryForPath(rootPath);
      if (repository == null || repository.getType() !== 'hg') {
        return null;
      }
      return (_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator(rootPath);
    }));
  } else {
    roots = rootPaths.map(root => (_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator(root));
  }

  const sortedFilePaths = Array.from(fileChanges.entries()).sort(([filePath1], [filePath2]) => (_nuclideUri || _load_nuclideUri()).default.basename(filePath1).toLowerCase().localeCompare((_nuclideUri || _load_nuclideUri()).default.basename(filePath2).toLowerCase()));

  const changedRoots = new Map(roots.map(root => {
    const rootChanges = new Map(sortedFilePaths.filter(([filePath]) => (_nuclideUri || _load_nuclideUri()).default.contains(root, filePath)));
    return [root, rootChanges];
  }));

  return changedRoots;
}

function confirmAndDeletePath(nuclideFilePath) {
  const result = atom.confirm({
    message: 'Are you sure you want to delete the following item?',
    detailedMessage: `You are deleting: \n ${(_nuclideUri || _load_nuclideUri()).default.getPath(nuclideFilePath)}`,
    buttons: ['Delete', 'Cancel']
  });

  if (!(result === 0 || result === 1)) {
    throw new Error('Invariant violation: "result === 0 || result === 1"');
  }

  if (result === 0) {
    deleteFile(nuclideFilePath);
  }
}