__author__ = 'hsk81'

###############################################################################
###############################################################################

from threading import Thread, Event

from ..app import app
from ..util import PickleZlib

import zmq

###############################################################################
###############################################################################

context = zmq.Context (1)

###############################################################################
###############################################################################

class Worker (Thread):

    class Logger (object):

        def __init__ (self, app):

            self.app = app

        def __getattr__ (self, attr):

            fn = getattr (self.app.logger, attr)
            if callable (fn):
                def gn (*args, **kwargs):
                    with app.test_request_context ():
                        fn (*args, **kwargs)

                return gn
            else:
                return fn

    class ResourceManager (object):

        def __init__ (self, **kwargs):

            self.ping_address = kwargs ['ping_address']
            assert self.ping_address
            self.data_address = kwargs ['data_address']
            assert self.data_address
            self.poll_timeout = kwargs ['poll_timeout']
            assert self.poll_timeout

        def __enter__ (self):

            self.ping_socket = context.socket (zmq.REP)
            self.ping_socket.connect (self.ping_address)
            self.ping_socket.LINGER = 0
            self.data_socket = context.socket (zmq.REP)
            self.data_socket.connect (self.data_address)
            self.data_socket.LINGER = 0

            self.ping_poller = zmq.Poller ()
            self.ping_poller.register (self.ping_socket, zmq.POLLIN)
            self.data_poller = zmq.Poller ()
            self.data_poller.register (self.data_socket, zmq.POLLIN)

            return self

        def __exit__ (self, exc_type, exc_val, exc_tb):

            self.ping_socket.close ()
            self.data_socket.close ()

    def __init__ (self, **kwargs):

        super (Worker, self).__init__ ()

        self.logger = Worker.Logger (app)
        self.kwargs = kwargs
        self.do_stop = Event ()
        self.is_stopped = Event ()
        self.setDaemon (True)

    @property
    def stopped (self):

        return self.is_stopped.isSet ()

    def stop (self):

        self.do_stop.set ()

    def run (self):

        with Worker.ResourceManager (**self.kwargs) as resource:
            while not self.do_stop.isSet ():

                self._do_ping (resource)
                self._do_data (resource)

            self.is_stopped.set ()

    def _do_ping (self, resource):

        if resource.ping_poller.poll (resource.poll_timeout):

            ping = resource.ping_socket.recv ()
            self.logger.debug ('%r received ping:%s' % (self, ping))
            resource.ping_socket.send (ping)
            self.logger.debug ('%r send-ing ping:%s' % (self, ping))

    def _do_data (self, resource):

        if resource.data_poller.poll (resource.poll_timeout):
            data = resource.data_socket.recv ()
            self.logger.debug ('%r received data:%x' % (self, hash (data)))

            try:
                data = self._process (data)
            except Exception, ex:
                data = ex

            PickleZlib.send_pyobj (resource.data_socket, data)
            self.logger.debug ('%r send-ing data:%x' % (self, hash (data)))

    def _process (self, data):

        import base64
        return base64.encodestring (data)

###############################################################################
###############################################################################
